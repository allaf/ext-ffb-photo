const PICTURE_SELECTOR = "img.border-white.rounded-circle";

browser.runtime.onMessage.addListener((message) => {
  if (message?.type !== "GET_LICENSEE_PICTURE") {
    return undefined;
  }

  return Promise.resolve(getLicenseePicture());
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
