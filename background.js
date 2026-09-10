const MENU_ID = "download-ffboxe-licensee-picture";
const PROFILE_URL_PATTERN = "https://extranet.ffboxe.com/personnes/fiche/*/*";

browser.runtime.onInstalled.addListener(async () => {
    await browser.menus.removeAll();

    browser.menus.create({
        id: MENU_ID,
        title: "=====> Télécharger la photo du licencié",
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

async function notify(title, message) {
    await browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("icons/icon.svg"),
        title,
        message
    });
}
