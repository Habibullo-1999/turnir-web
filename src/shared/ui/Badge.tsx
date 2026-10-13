import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const TONES = {
  neutral: 'bg-surface text-ink-muted border-line',
  brand: 'bg-brand/10 text-brand border-brand/30',
  gold: 'bg-gold/10 text-gold border-gold/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  lucky: 'bg-lucky/10 text-lucky border-lucky/30',
} as const;

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
