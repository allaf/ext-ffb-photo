const POLL_INTERVAL_MS = 3000;

setInterval(() => {
  browser.runtime
    .sendMessage({ type: "POLL_SHEET_JOBS" })
    .catch(() => {
      // L’arrière-plan peut être momentanément arrêté par Firefox.
      // Le prochain intervalle le réveillera à nouveau.
    });
}, POLL_INTERVAL_MS);

browser.runtime
  .sendMessage({ type: "POLL_SHEET_JOBS" })
  .catch(() => {});
