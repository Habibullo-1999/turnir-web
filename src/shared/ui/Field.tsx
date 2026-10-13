import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const CONTROL =
  'bg-surface border-line text-ink placeholder:text-ink-dim w-full rounded-lg border px-3 py-2 text-sm ' +
  'outline-none transition-colors focus:border-brand-dim disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(CONTROL, className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(CONTROL, 'cursor-pointer', className)} {...props} />;
  },
);

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-ink-muted text-xs font-medium">{label}</span>}
      {children}
      {error ? (
        <span className="text-danger text-xs">{error}</span>
      ) : (
        hint && <span className="text-ink-dim text-xs">{hint}</span>
      )}
    </label>
  );
}
