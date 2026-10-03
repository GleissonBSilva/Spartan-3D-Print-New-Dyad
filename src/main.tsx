import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(<App />);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(error => console.error('Offline shell registration failed', error));
  });
}
