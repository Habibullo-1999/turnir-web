import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Field, Input } from '@/shared/ui/Field';
import { errorMessage } from '@/shared/api/http';
import type { Role } from '@/shared/api/types';
import { useSession, useUpdateProfile } from '@/features/auth/session';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Администратор системы',
  organizer: 'Организатор',
  viewer: 'Только чтение',
};

export function AccountCard() {
  const { user } = useSession();
  const update = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  if (!user) return null;

  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();
  const nameChanged = displayName.trim() !== user.displayName;
  const canSave = (nameChanged || emailChanged) && displayName.trim() && email.trim();

  return (
    <Card>
      <CardTitle action={<Badge tone="neutral">{ROLE_LABELS[user.role]}</Badge>}>Аккаунт</CardTitle>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate({
            ...(nameChanged ? { displayName: displayName.trim() } : {}),
            ...(emailChanged ? { email: email.trim() } : {}),
          });
        }}
      >
        <Field label="Логин" hint="Изменить нельзя — по нему вы входите">
          <Input readOnly disabled value={user.username} />
        </Field>

        <Field label="Отображаемое имя" hint="Его видят в списке участников организации">
          <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </Field>

        <Field
          label="Почта"
          hint={
            emailChanged
              ? 'После сохранения адрес придётся подтвердить заново — на него уйдёт письмо.'
              : user.emailVerifiedAt
                ? '✅ Подтверждена'
                : 'Не подтверждена'
          }
        >
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>

        {update.isError && <p className="text-danger text-sm">⚠️ {errorMessage(update.error)}</p>}
        {update.isSuccess && !nameChanged && !emailChanged && (
          <p className="text-brand text-sm">Сохранено.</p>
        )}

        <Button type="submit" variant="primary" disabled={!canSave || update.isPending}>
          {update.isPending ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </form>
    </Card>
  );
}
