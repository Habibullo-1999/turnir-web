import { Card } from '@/shared/ui/Card';
import { LinkButton } from '@/shared/ui/LinkButton';

export function NotFoundPage() {
  return (
    <Card className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="text-4xl">🤷</span>
      <p className="text-ink-muted text-sm">Такой страницы нет.</p>
      <LinkButton variant="primary" to="/">
        На главную
      </LinkButton>
    </Card>
  );
}
