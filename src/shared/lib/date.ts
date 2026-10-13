const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function formatLongDate(value: string | number | Date | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

/** Значение для <input type="date"> — всегда ГГГГ-ММ-ДД по локальному времени. */
export function toDateInputValue(value: string | number | Date | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Обратно в миллисекунды, сохраняя время суток из исходной отметки. */
export function fromDateInputValue(input: string, previous?: string | number | null): number {
  const [year, month, day] = input.split('-').map(Number);
  if (!year || !month || !day) return Date.now();

  const base = previous ? new Date(previous) : new Date();
  const result = Number.isNaN(base.getTime()) ? new Date() : base;
  result.setFullYear(year, month - 1, day);
  return result.getTime();
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}
