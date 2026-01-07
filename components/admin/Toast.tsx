"use client";

import { useState, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastQueue: Toast[] = [];
let toastListeners: ((toasts: Toast[]) => void)[] = [];

export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
  info: (message: string) => addToast(message, "info"),
  warning: (message: string) => addToast(message, "warning"),
};

function addToast(message: string, type: ToastType) {
  const id = Date.now().toString();
  const newToast: Toast = { id, message, type };
  toastQueue = [...toastQueue, newToast];
  notifyListeners();

  // Auto remove after 3 seconds
  setTimeout(() => removeToast(id), 3000);
}

function removeToast(id: string) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  notifyListeners();
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastQueue]));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-white",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${
            typeStyles[t.type]
          } px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}
        >
          <span className="text-xl">{icons[t.type]}</span>
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="hover:opacity-80 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
