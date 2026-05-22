import { useEffect, useState } from "react";
import "../Styles/Toast.css";

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const id = Date.now() + Math.random();
      const toast = {
        id,
        type: event.detail?.type || "info",
        message: event.detail?.message || "",
      };

      setToasts((current) => [...current, toast]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener("toast:add", handleToast);

    return () => {
      window.removeEventListener("toast:add", handleToast);
    };
  }, []);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
