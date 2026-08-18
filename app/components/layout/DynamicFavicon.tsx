"use client";

import { useEffect } from "react";

export function updateBrowserFavicon(url: string) {
  if (!url) return;

  // Supprimer les balises rel icon existantes pour forcer le navigateur à détecter le changement
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach((el) => el.remove());

  // Déterminer le MIME type approprié
  let mimeType = "image/png";
  if (url.startsWith("data:image/x-icon") || url.startsWith("data:image/vnd.microsoft.icon") || url.endsWith(".ico")) {
    mimeType = "image/x-icon";
  } else if (url.startsWith("data:image/svg") || url.endsWith(".svg")) {
    mimeType = "image/svg+xml";
  } else if (url.startsWith("data:image/jpeg") || url.endsWith(".jpg") || url.endsWith(".jpeg")) {
    mimeType = "image/jpeg";
  }

  // Créer la nouvelle balise icon
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = mimeType;
  link.href = url;

  // Créer aussi la balise pour Apple Touch Icon
  const appleLink = document.createElement("link");
  appleLink.rel = "apple-touch-icon";
  appleLink.href = url;

  document.head.appendChild(link);
  document.head.appendChild(appleLink);
}

export default function DynamicFavicon() {
  useEffect(() => {
    const applyFavicon = () => {
      fetch("/api/settings", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.favicon_url) {
            updateBrowserFavicon(data.favicon_url);
          }
        })
        .catch((err) => console.error("Error loading dynamic favicon:", err));
    };

    applyFavicon();

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        updateBrowserFavicon(customEvent.detail);
      } else {
        applyFavicon();
      }
    };

    window.addEventListener("faviconUpdated", handleCustomEvent);
    return () => window.removeEventListener("faviconUpdated", handleCustomEvent);
  }, []);

  return null;
}
