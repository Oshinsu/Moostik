/**
 * MOOSTIK - Download Utilities
 * Fonctions utilitaires pour le téléchargement de fichiers
 */

/**
 * Télécharge une image depuis une URL
 * @param url - URL de l'image à télécharger
 * @param filename - Nom du fichier (sans extension)
 * @param extension - Extension du fichier (défaut: "png")
 */
export async function downloadImage(
  url: string,
  filename: string,
  extension: string = "png"
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Erreur téléchargement:", error);
    // Fallback: ouvrir dans un nouvel onglet
    window.open(url, "_blank");
  }
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
