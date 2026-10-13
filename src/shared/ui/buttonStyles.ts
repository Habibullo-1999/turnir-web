import { cn } from '@/shared/lib/cn';

const VARIANTS = {
  primary: 'bg-brand text-bg hover:bg-brand/90 disabled:bg-brand/40',
  secondary: 'bg-surface text-ink border border-line hover:border-brand-dim disabled:text-ink-dim',
  ghost: 'bg-transparent text-ink-muted hover:bg-white/5 hover:text-ink',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
} as const;

const SIZES = {
  sm: 'px-2.5 py-1 text-xs gap-1',
  md: 'px-4 py-2 text-sm gap-1.5',
  lg: 'px-5 py-2.5 text-base gap-2',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

/** Общие классы кнопки — чтобы ссылка-кнопка выглядела ровно так же. */
export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap',
    'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
