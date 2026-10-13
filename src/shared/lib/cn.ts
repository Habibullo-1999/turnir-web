import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Склеивает классы и разрешает конфликты Tailwind в пользу последнего. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
