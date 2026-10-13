import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Field';

/** Публичная ссылка открывает турнир без токена — только на просмотр. */
export function ShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${location.origin}/view/${encodeURIComponent(slug)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер обмена недоступен (не-https, отказ в правах) — ссылка видна в поле.
      setCopied(false);
    }
  }

  return (
    <Card>
      <CardTitle>🔗 Ссылка для просмотра</CardTitle>
      <p className="text-ink-muted mb-3 text-xs">
        Отправьте её — гости увидят турнир в реальном времени и не смогут менять счёт.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
        <Button variant="primary" onClick={copy}>
          {copied ? '✓ Скопировано' : 'Копировать'}
        </Button>
      </div>
    </Card>
  );
}
