import type { HTMLAttributes, ReactNode, ThHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/** Горизонтальная прокрутка — обязательна: таблицы читают с телефона. */
export function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('-mx-1 overflow-x-auto px-1', className)}>{children}</div>;
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-sm whitespace-nowrap', className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'text-ink-dim border-line border-b px-2 py-2 text-center text-xs font-semibold first:text-left',
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('border-line/60 border-b px-2 py-2 text-center first:text-left', className)}
      {...props}
    />
  );
}

/** Зелёный плюс / красный минус — одинаково во всех таблицах. */
export function DiffCell({ value }: { value: number }) {
  return (
    <Td className={value > 0 ? 'text-brand' : value < 0 ? 'text-danger' : 'text-ink-muted'}>
      {value > 0 ? '+' : ''}
      {value}
    </Td>
  );
}
