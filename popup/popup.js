const processButton = document.querySelector("#process-button");
const registrationButton = document.querySelector("#registration-button");
const optionsButton = document.querySelector("#options-button");
const status = document.querySelector("#status");

processButton.addEventListener("click", async () => {
  setButtonsDisabled(true);
  showStatus("Recherche des demandes en attente…");

  try {
    const result = await browser.runtime.sendMessage({
      type: "PROCESS_PENDING_JOBS"
    });

    if (!result?.ok) {
      throw new Error(result?.error || "Traitement impossible.");
    }

    if (result.skipped) {
      showStatus("Un traitement est déjà en cours.");
      return;
    }

    if (result.found === 0) {
      showStatus("Aucune demande en attente.", true);
      return;
    }

    const failureText = result.failed
      ? ` ${result.failed} échec(s).`
      : "";

    showStatus(
      `${result.processed} photo(s) traitée(s).${failureText}`,
      result.failed === 0
    );
  } catch (error) {
    showStatus(error?.message || "Une erreur inconnue est survenue.", false);
  } finally {
    setButtonsDisabled(false);
  }
});

registrationButton.addEventListener("click", async () => {
  setButtonsDisabled(true);
  showStatus("Récupération de l’inscription préparée…");

  try {
    const result = await browser.runtime.sendMessage({
      type: "FILL_PENDING_REGISTRATION"
    });

    if (!result?.ok) {
      throw new Error(result?.error || "Remplissage impossible.");
    }

    showStatus(
      `Formulaire rempli pour ${result.firstName} ${result.lastName}. Vérifie les données avant de valider.`,
      true
    );
  } catch (error) {
    showStatus(error?.message || "Une erreur inconnue est survenue.", false);
  } finally {
    setButtonsDisabled(false);
  }
});

optionsButton.addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

function setButtonsDisabled(disabled) {
  processButton.disabled = disabled;
  registrationButton.disabled = disabled;
  optionsButton.disabled = disabled;
}

function showStatus(message, success = null) {
  status.textContent = message;
  status.className = success === null ? "" : success ? "success" : "error";
}
