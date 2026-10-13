/** Сохраняет объект в файл на устройстве пользователя — без обращения к серверу. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/** Имя файла без пробелов и знаков, которые не любят файловые системы. */
export function safeFilename(...parts: Array<string | number>) {
  return parts
    .map((part) => String(part).replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, ''))
    .filter(Boolean)
    .join('_');
}
