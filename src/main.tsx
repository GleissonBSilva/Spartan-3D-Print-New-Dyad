import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Limpa qualquer Service Worker e CacheStorage residual em todos os ambientes
// para garantir carregamento sempre atualizado e sem cruzamento de sessão.
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
  if ('caches' in window) {
    caches.keys().then(keys => {
      for (const key of keys) {
        caches.delete(key).catch(() => {});
      }
    }).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
