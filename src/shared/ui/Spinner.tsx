import { cn } from '@/shared/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Загрузка"
      className={cn(
        'border-line border-t-brand inline-block size-5 animate-spin rounded-full border-2',
        className,
      )}
    />
  );
}
