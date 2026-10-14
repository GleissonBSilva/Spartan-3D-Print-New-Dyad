import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Limpa qualquer Service Worker residual em localhost ou desenvolvimento local
// para prevenir tela branca por cache de bundle antigo de produção.
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

if (!import.meta.env.PROD || isLocalhost) {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
} else if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(error => console.error('Offline shell registration failed', error));
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
