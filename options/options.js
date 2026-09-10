const form = document.querySelector("#settings-form");
const status = document.querySelector("#status");
const testButton = document.querySelector("#test-button");

restoreSettings();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const settings = readForm();

  await browser.storage.local.set(settings);
  showStatus("Préférences enregistrées.", true);
});

testButton.addEventListener("click", async () => {
  const settings = readForm();

  if (!settings.appsScriptUrl || !settings.apiToken) {
    showStatus("Renseigne l’URL /exec et le jeton.", false);
    return;
  }

  testButton.disabled = true;
  showStatus("Test en cours…", true);

  const result = await browser.runtime.sendMessage({
    type: "TEST_APPS_SCRIPT",
    settings
  });

  testButton.disabled = false;

  if (result?.ok) {
    showStatus(
      `Connexion réussie. ${result.pendingJobs} demande(s) en attente.`,
      true
    );
  } else {
    showStatus(result?.error || "Connexion impossible.", false);
  }
});

async function restoreSettings() {
  const settings = await browser.storage.local.get({
    appsScriptUrl: "",
    apiToken: ""
  });

  for (const [key, value] of Object.entries(settings)) {
    const input = form.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  }
}

function readForm() {
  const formData = new FormData(form);

  return {
    appsScriptUrl: String(formData.get("appsScriptUrl") || "").trim(),
    apiToken: String(formData.get("apiToken") || "").trim()
  };
}

function showStatus(message, success) {
  status.textContent = message;
  status.className = success ? "success" : "error";
}
