const MENU_ID = "download-ffboxe-licensee-picture";
const PROFILE_URL_PATTERN =
  "https://extranet.ffboxe.com/personnes/fiche/*/infos*";
const MAX_PARALLEL_JOBS = 3;
const APPS_SCRIPT_TIMEOUT_MS = 60000;
let processingInProgress = false;

browser.runtime.onInstalled.addListener(async () => {
  await browser.storage.local.remove(["username", "password"]);
  await browser.menus.removeAll();

  browser.menus.create({
    id: MENU_ID,
    title: "Télécharger la photo du licencié",
    contexts: ["page", "image"],
    documentUrlPatterns: [PROFILE_URL_PATTERN]
  });
});

browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) {
    return;
  }

  try {
    const picture = await browser.tabs.sendMessage(tab.id, {
      type: "GET_LICENSEE_PICTURE"
    });

    if (!picture?.ok) {
      throw new Error(picture?.error || "Photo introuvable sur cette fiche.");
    }

    await browser.downloads.download({
      url: picture.imageUrl,
      filename: picture.filename,
      conflictAction: "overwrite",
      saveAs: false
    });

    await notify(
      "Photo téléchargée",
      `${picture.filename} a été enregistré dans Téléchargements/FFBoxe.`
    );
  } catch (error) {
    console.error("Échec du téléchargement FFBoxe", error);
    await notify(
      "Téléchargement impossible",
      error?.message || "Une erreur inconnue est survenue."
    );
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "PROCESS_PENDING_JOBS") {
    return processPendingJobsOnce();
  }

  if (message?.type === "TEST_APPS_SCRIPT") {
    return testAppsScriptConnection(message.settings);
  }

  return undefined;
});

async function processPendingJobsOnce() {
  if (processingInProgress) {
    return { ok: true, skipped: true };
  }

  processingInProgress = true;

  try {
    const settings = await loadSettings();

    if (!settings.appsScriptUrl || !settings.apiToken) {
      return {
        ok: false,
        configurationMissing: true,
        error: "Configure l’URL Apps Script et le jeton dans les préférences."
      };
    }

    const pending = await getPendingJobs(settings);
    let processed = 0;
    let failed = 0;

    for (let index = 0; index < pending.length; index += MAX_PARALLEL_JOBS) {
      const batch = pending.slice(index, index + MAX_PARALLEL_JOBS);
      const results = await Promise.all(
        batch.map((job) => processSheetJob(job, settings))
      );

      processed += results.filter((result) => result.ok).length;
      failed += results.filter((result) => !result.ok).length;
    }

    return {
      ok: true,
      found: pending.length,
      processed,
      failed
    };
  } catch (error) {
    console.error("Échec de la synchronisation Google Sheet", error);
    return { ok: false, error: error.message };
  } finally {
    processingInProgress = false;
  }
}

async function processSheetJob(pendingJob, settings) {
  let claimedJob;

  try {
    const claimResponse = await postAppsScript(settings, {
      action: "claimJob",
      requestId: pendingJob.requestId
    });

    claimedJob = claimResponse.job;

    const picture = await fetchLicenseePicture(claimedJob.userId);

    await postAppsScript(settings, {
      action: "uploadPicture",
      requestId: claimedJob.requestId,
      userId: claimedJob.userId,
      mimeType: picture.mimeType,
      imageBase64: picture.imageBase64
    });

    return { ok: true };
  } catch (error) {
    console.error(`Échec de la demande ${pendingJob.requestId}`, error);

    const requestId = claimedJob?.requestId || pendingJob.requestId;

    try {
      await postAppsScript(settings, {
        action: "failJob",
        requestId,
        error: error.message
      });
    } catch (reportError) {
      console.error("Impossible de signaler l’erreur à Apps Script", reportError);
    }

    await notify(
      "Synchronisation impossible",
      `Licence ${pendingJob.userId} : ${error.message}`
    );

    return { ok: false, error: error.message };
  }
}

async function getPendingJobs(settings) {
  const url = new URL(settings.appsScriptUrl);
  url.searchParams.set("action", "pendingJobs");
  url.searchParams.set("token", settings.apiToken);

  const response = await fetchWithTimeout(url.toString(), {
    method: "GET",
    credentials: "include",
    redirect: "follow",
    cache: "no-store"
  });

  const data = await parseJsonResponse(response);

  if (!data.success) {
    throw new Error(data.error || "Apps Script a refusé la demande.");
  }

  return Array.isArray(data.jobs) ? data.jobs : [];
}

async function postAppsScript(settings, payload) {
  const response = await fetchWithTimeout(settings.appsScriptUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      ...payload,
      token: settings.apiToken
    }),
    redirect: "follow"
  });

  const data = await parseJsonResponse(response);

  if (!data.success) {
    throw new Error(data.error || "Erreur retournée par Apps Script.");
  }

  return data;
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    APPS_SCRIPT_TIMEOUT_MS
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Apps Script ne répond pas après 60 secondes. Vérifie le déploiement et les autorisations."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} : ${text.slice(0, 200)}`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      "La réponse Apps Script n’est pas du JSON. Vérifie l’URL /exec et les droits du déploiement."
    );
  }
}

async function fetchLicenseePicture(userId) {
  const profileUrl =
    `https://extranet.ffboxe.com/personnes/fiche/${encodeURIComponent(userId)}/infos`;

  const pageResponse = await fetch(profileUrl, {
    credentials: "include",
    redirect: "follow",
    cache: "no-store"
  });

  const pageHtml = await pageResponse.text();

  if (isLoginPage(pageResponse.url, pageHtml)) {
    throw new Error("Session FFBoxe expirée. Connecte-toi au site puis relance la demande.");
  }

  const document = new DOMParser().parseFromString(pageHtml, "text/html");
  const image = document.querySelector("img.border-white.rounded-circle");
  const source = image?.getAttribute("src");

  if (!source) {
    throw new Error("Photo introuvable sur la fiche licencié.");
  }

  if (source.includes("/elicence-core")) {
    throw new Error("Ce licencié utilise la photo par défaut.");
  }

  const imageUrl = new URL(source, pageResponse.url).href;
  const imageResponse = await fetch(imageUrl, {
    credentials: "include",
    redirect: "follow",
    cache: "no-store"
  });

  if (!imageResponse.ok) {
    throw new Error(`Téléchargement de l’image refusé (${imageResponse.status}).`);
  }

  const blob = await imageResponse.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("Le fichier reçu n’est pas une image.");
  }

  return {
    mimeType: blob.type || "image/jpeg",
    imageBase64: await blobToBase64(blob)
  };
}

function isLoginPage(url, html) {
  return (
    url.includes("/auth/login") ||
    /<form[^>]+(?:action=["'][^"']*\/auth\/login|id=["'][^"']*login)/i.test(html)
  );
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture de l’image impossible."));
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      resolve(dataUrl.substring(dataUrl.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

async function loadSettings() {
  return browser.storage.local.get({
    appsScriptUrl: "",
    apiToken: ""
  });
}

async function testAppsScriptConnection(settings) {
  try {
    const jobs = await getPendingJobs(settings);
    return { ok: true, pendingJobs: jobs.length };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function notify(title, message) {
  await browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("icons/icon.svg"),
    title,
    message
  });
}
