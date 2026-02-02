/**
 * MOOSTIK - Download Utilities
 * Fonctions utilitaires pour le téléchargement de fichiers
 */

/**
 * Télécharge une image depuis une URL
 * Force le téléchargement direct du fichier
 * @param url - URL de l'image à télécharger
 * @param filename - Nom du fichier (sans extension)
 * @param extension - Extension du fichier (défaut: "png")
 */
export async function downloadImage(
  url: string,
  filename: string,
  extension: string = "png"
): Promise<void> {
  // Nettoyer le filename
  const cleanFilename = filename.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  const fullFilename = `${cleanFilename}.${extension}`;

  try {
    // Méthode 1: Fetch + Blob (meilleure pour les fichiers locaux)
    const response = await fetch(url, {
      mode: "cors",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fullFilename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

    console.log(`✅ Téléchargé: ${fullFilename}`);
  } catch (error) {
    console.warn("Fetch failed, trying download API:", error);

    // Méthode 2: Utiliser l'API de téléchargement serveur
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fullFilename)}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fullFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      console.log(`✅ Téléchargé via API: ${fullFilename}`);
    } catch (apiError) {
      console.error("Download API failed:", apiError);

      // Méthode 3: Fallback - Forcer le téléchargement avec un iframe caché
      forceDownload(url, fullFilename);
    }
  }
}

/**
 * Force le téléchargement d'une URL
 * Utilise un lien avec download attribute
 */
function forceDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  // Forcer le download attribute
  link.setAttribute("download", filename);

  // Ajouter au DOM et cliquer
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);

  console.log(`⚠️ Fallback download: ${filename}`);
}

/**
 * Télécharge une image directement via l'API serveur
 * Contourne les problèmes CORS
 */
export async function downloadImageViaServer(
  url: string,
  filename: string
): Promise<void> {
  const cleanFilename = filename.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();

  // Appeler l'API qui va faire le proxy et retourner le fichier
  const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanFilename)}`;

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = cleanFilename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

/**
 * Télécharge plusieurs images avec un délai entre chaque
 * @param items - Liste d'items avec url et filename
 * @param delayMs - Délai entre chaque téléchargement (défaut: 500ms)
 */
export async function downloadMultipleImages(
  items: Array<{ url: string; filename: string }>,
  delayMs: number = 500
): Promise<void> {
  for (const item of items) {
    await downloadImage(item.url, item.filename);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * Formate une taille en bytes en format lisible
 * @param bytes - Taille en bytes
 * @returns Taille formatée (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
