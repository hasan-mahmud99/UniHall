const EVENT_NAME = "uh:confirm";

export function confirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    try {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: {
            message: String(message || ""),
            title: options.title || "Confirm",
            confirmText: options.confirmText || "Confirm",
            cancelText: options.cancelText || "Cancel",
            danger: Boolean(options.danger),
            resolve,
          },
        })
      );
    } catch (_) {
      // Fallback to native confirm if CustomEvent isn't available.
      resolve(window.confirm(String(message || "")));
    }
  });
}

export default confirmDialog;
