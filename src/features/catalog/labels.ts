import type { Format } from '@/shared/api/types';

export const FORMAT_LABELS: Record<Format, string> = {
  playoff: '🏆 Плей-офф',
  group: '📊 Групповой',
  'group+playoff': '📊→🏆 Группы + плей-офф',
  league: '🏅 Лига',
};

export const FORMAT_OPTIONS = (Object.keys(FORMAT_LABELS) as Format[]).map((value) => ({
  value,
  label: FORMAT_LABELS[value],
}));

/** Форматы существуют только у движка сетки/групп — у остальных их нет. */
export function formatLabel(format: Format | undefined) {
  return format ? FORMAT_LABELS[format] : '';
}

/** В группах и лиге таблица есть всегда, в чистом плей-офф — нет. */
export function hasGroupStage(format: Format | undefined) {
  return format === 'group' || format === 'group+playoff' || format === 'league';
}
