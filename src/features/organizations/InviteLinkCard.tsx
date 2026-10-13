import { useState } from 'react';
import type { OrganizationInvite } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Field';

/**
 * Ссылка приходит ровно один раз — в ответе на создание. В базе лежит только её
 * sha256, поэтому показать её повторно неоткуда, и об этом надо предупредить.
 */
export function InviteLinkCard({ invite }: { invite: OrganizationInvite }) {
  const [copied, setCopied] = useState(false);
  if (!invite.url) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(invite.url!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="border-brand/30 bg-brand/5 flex flex-col gap-2 rounded-xl border p-3">
      <div className="text-brand text-sm font-semibold">
        ✅ Приглашение{invite.playerName ? ` для «${invite.playerName}»` : ''} создано
      </div>
      <p className="text-ink-muted text-xs">
        Отправьте ссылку человеку. Она показывается <strong>один раз</strong> — потом её
        не восстановить, останется только выпустить новую.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={invite.url} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
        <Button variant="primary" onClick={copy}>
          {copied ? '✓ Скопировано' : 'Копировать'}
        </Button>
      </div>
    </div>
  );
}
