/** Русское склонение по числу: plural(5, 'гол', 'гола', 'голов') → 'голов'. */
export function plural(count: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(count) % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;

  const mod10 = mod100 % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function withPlural(count: number, one: string, few: string, many: string): string {
  return `${count} ${plural(count, one, few, many)}`;
}

export const goals = (count: number) => withPlural(count, 'гол', 'гола', 'голов');
export const reps = (count: number) => withPlural(count, 'подтягивание', 'подтягивания', 'подтягиваний');
export const players = (count: number) => withPlural(count, 'игрок', 'игрока', 'игроков');
export const matches = (count: number) => withPlural(count, 'матч', 'матча', 'матчей');
