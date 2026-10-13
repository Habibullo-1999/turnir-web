import type { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Spinner } from './Spinner';
import { errorMessage } from '@/shared/api/http';

export function LoadingState({ text = 'Загрузка…' }: { text?: string }) {
  return (
    <div className="text-ink-muted flex items-center justify-center gap-3 py-12 text-sm">
      <Spinner />
      {text}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = 'Не удалось загрузить данные',
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <Card className="flex flex-col items-start gap-3">
      <div className="text-danger text-sm">⚠️ {title}</div>
      <div className="text-ink-muted text-sm">{errorMessage(error)}</div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="text-ink-muted flex flex-col items-center gap-3 py-10 text-center text-sm">
      {children}
      {action}
    </div>
  );
}
