export const emitToast = (message, severity = "info") => {
  window.dispatchEvent(
    new CustomEvent("shipment-mpci-toast", {
      detail: { message: String(message || ""), severity },
    }),
  );
};

export const ErrorToastAlert = (message) => emitToast(message, "error");
export const SuccessToastAlert = (message) => emitToast(message, "success");
