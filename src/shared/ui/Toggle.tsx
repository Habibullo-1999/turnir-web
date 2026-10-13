import { cn } from '@/shared/lib/cn';

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

/** Ряд кнопок-переключателей: фильтры видов спорта, выбор формата, вкладки. */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            option.value === value
              ? 'border-brand/50 bg-brand/10 text-brand'
              : 'border-line bg-surface text-ink-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
