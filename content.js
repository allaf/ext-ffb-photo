const PICTURE_SELECTOR = "img.border-white.rounded-circle";

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "GET_LICENSEE_PICTURE") {
    return Promise.resolve(getLicenseePicture());
  }

  if (message?.type === "FILL_FFB_REGISTRATION") {
    return fillFfbRegistration(message.registration);
  }

  return undefined;
});

function getLicenseePicture() {
  const userId = extractUserId(window.location.pathname);

  if (!userId) {
    return {
      ok: false,
      error: "Le numéro du licencié est absent de l’adresse de la page."
    };
  }

  const image = document.querySelector(PICTURE_SELECTOR);
  const imageUrl = image?.currentSrc || image?.src;

  if (!imageUrl) {
    return {
      ok: false,
      error: "La photo du licencié n’a pas été trouvée sur la page."
    };
  }

  if (imageUrl.includes("/elicence-core")) {
    return {
      ok: false,
      error: "Ce licencié utilise la photo par défaut."
    };
  }

  const extension = extractExtension(imageUrl);

  return {
    ok: true,
    userId,
    imageUrl,
    filename: `FFBoxe/licencie_${sanitizeFilename(userId)}.${extension}`
  };
}

async function fillFfbRegistration(data) {
  try {
    if (!data) {
      throw new Error("Aucune donnée d’inscription reçue.");
    }

    if (!document.querySelector("#mainForm")) {
      throw new Error(
        "Le formulaire d’inscription FFBoxe n’est pas ouvert dans cet onglet."
      );
    }

    setValue('select[name="ddn_lieu_pays"]', '250');
    //setValue('select[name="id_departement_naissance"]', '35');
    setValue('select[name="civilite"]', 'M');
    setValue('input[name="nom"]', data.lastName);
    setValue('input[name="prenom"]', data.firstName);
    setValue('input[name="nom_naissance"]', data.lastName);
    setValue('input[name="ddn"]', data.birthDate, true);

    setValue('input[name="adresse[mail]"]', data.email);
    setValue('input[name="adresse[tel]"]', data.phone);

    setValue("#representant_legal_nom", data.parentLastName || data.lastName);
    setValue("#representant_legal_prenom", data.parentFirstName);
    setValue("#representant_legal_telephone", data.phone);
    setValue("#representant_legal_mail", data.email);

    setValue('input[name="adresse[code_postal]"]', data.postalCode || "34000", true);
    await selectCommune(data.city || "MONTPELLIER");

    return {
      ok: true,
      firstName: data.firstName,
      lastName: data.lastName
    };
  } catch (error) {
    console.error("Remplissage inscription FFBoxe impossible", error);
    return { ok: false, error: error.message };
  }
}

function setValue(selector, value, blur = false) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Champ introuvable : ${selector}`);
  }

  element.focus();
  element.value = value ?? "";
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));

  if (blur) {
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }
}

async function selectCommune(city) {
  const select = document.querySelector('select[name="adresse[commune_liste]"]');

  if (!select) {
    throw new Error("Liste des communes introuvable.");
  }

  const normalizedCity = normalizeText(city);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const option = Array.from(select.options).find((candidate) =>
      normalizeText(candidate.textContent).includes(normalizedCity)
    );

    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    await sleep(200);
  }

  const freeText = document.querySelector('input[name="adresse[commune_libre]"]');

  if (freeText && !freeText.disabled) {
    setValue('input[name="adresse[commune_libre]"]', city);
    return;
  }

  throw new Error(`La commune ${city} n’a pas été chargée après le code postal.`);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractUserId(pathname) {
  const match = pathname.match(/\/personnes\/fiche\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : null;
}

function extractExtension(imageUrl) {
  try {
    const pathname = new URL(imageUrl, window.location.href).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    const extension = match?.[1]?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
      return extension;
    }
  } catch (error) {
    console.warn("Extension de la photo indéterminable", error);
  }

  return "jpg";
}

function sanitizeFilename(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
