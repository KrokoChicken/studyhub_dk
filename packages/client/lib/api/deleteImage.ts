export async function deleteImageFromStorageByPublicUrl(url: string) {
  try {
    await fetch("/api/storage/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch (e) {
    console.warn("Best-effort storage delete failed:", e);
  }
}