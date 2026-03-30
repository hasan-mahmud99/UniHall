const EVENT_NAME = "uh:toast";

function dispatchToast(detail) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  } catch (_) {
    // last resort
    if (detail?.message) window.alert(detail.message);
  }
}

export function notify(message, options = {}) {
  dispatchToast({
    type: options.type || "info",
    message: String(message || ""),
    durationMs:
      typeof options.durationMs === "number" ? options.durationMs : 3500,
  });
}

notify.success = (message, options = {}) =>
  notify(message, { ...options, type: "success" });
notify.error = (message, options = {}) =>
  notify(message, { ...options, type: "error" });
notify.info = (message, options = {}) =>
  notify(message, { ...options, type: "info" });

export default notify;
