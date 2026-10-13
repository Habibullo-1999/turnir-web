import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Сколько всего записей — показывается рядом, если известно. */
  total?: number;
  className?: string;
}

/**
 * Листание страниц. С одной страницей не показывается: кнопки, которые некуда
 * нажимать, только занимают место.
 */
export function Pagination({ page, totalPages, onChange, total, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`text-ink-muted mt-4 flex flex-wrap items-center justify-center gap-3 text-sm ${className ?? ''}`}
    >
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Назад
      </Button>

      <span className="tabular-nums">
        Страница {page} из {totalPages}
        {total !== undefined && <span className="text-ink-dim"> · всего {total}</span>}
      </span>

      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Вперёд →
      </Button>
    </div>
  );
}
