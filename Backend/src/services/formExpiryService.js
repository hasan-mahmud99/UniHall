const { expireAllExpiredForms } = require("../repositories/formRepository");

async function runFormExpiryCycle() {
  const { expiredCount } = await expireAllExpiredForms();
  return { expiredCount };
}

function startFormExpiryScheduler({ intervalMs = 5 * 60 * 1000 } = {}) {
  const safeInterval =
    Number.isFinite(intervalMs) && intervalMs > 10_000
      ? intervalMs
      : 5 * 60 * 1000;

  setInterval(() => {
    runFormExpiryCycle().catch((e) => {
      console.error("[formExpiry] scheduled run failed:", e.message);
    });
  }, safeInterval);

  // Kick off once at startup.
  runFormExpiryCycle().catch((e) => {
    console.error("[formExpiry] initial run failed:", e.message);
  });
}

module.exports = { runFormExpiryCycle, startFormExpiryScheduler };
