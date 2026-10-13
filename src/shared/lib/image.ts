const MAX_SIDE = 256;
const QUALITY = 0.85;

/**
 * Уменьшает картинку до аватарного размера прямо в браузере. Сервер ресайзить
 * не умеет — без этого в хранилище лежали бы снимки с телефона по несколько
 * мегабайт, которые потом грузились бы в списке игроков десятками.
 */
export async function resizeToAvatar(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    return blob ?? file;
  } catch {
    // Формат, который браузер не открыл (или запрет на canvas) — отдаём как
    // есть: дальше решает сервер, он всё равно проверяет содержимое.
    return file;
  }
}
