import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-card border-line rounded-2xl border p-5', className)} {...props} />;
}

/** Заголовок-«ярлык»: зелёная полоска слева, как во всём приложении. */
export function CardTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 className="text-brand flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase">
        <span className="bg-brand block h-3.5 w-[3px] rounded-sm" />
        {children}
      </h2>
      {action}
    </div>
  );
}
