import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input } from '@/shared/ui/Field';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { ORG_ROLE_LABELS } from './labels';
import { useCreateOrganization, useOrganizations } from './queries';

export function OrganizationsPage() {
  const { data: organizations, isPending, isError, error, refetch } = useOrganizations();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>Мои организации</CardTitle>

        {organizations.length === 0 ? (
          <EmptyState>
            Вы пока нигде не состоите. Создайте организацию ниже — или попросите
            ссылку-приглашение у того, кто уже ведёт турниры.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {organizations.map((org) => (
              <Link
                key={org.id}
                to={`/organizations/${org.id}`}
                className="border-line bg-surface hover:border-brand-dim flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-ink truncate text-sm font-medium">🏢 {org.name}</div>
                  <div className="text-ink-dim text-xs">
                    {org.memberCount} участников · /{org.slug}
                  </div>
                </div>
                <Badge tone={org.role === 'member' ? 'neutral' : 'brand'}>
                  {ORG_ROLE_LABELS[org.role ?? 'member']}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <CreateOrganizationCard />
    </div>
  );
}

function CreateOrganizationCard() {
  const create = useCreateOrganization();
  const [name, setName] = useState('');

  return (
    <Card>
      <CardTitle>Новая организация</CardTitle>

      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate({ name: name.trim() }, { onSuccess: () => setName('') });
        }}
      >
        <Field
          label="Название"
          hint="Адрес составится сам — с транслитерацией. Турниры и игроки разных организаций не пересекаются."
        >
          <Input
            placeholder="Например: Алиф или Дворовая лига"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        {create.isError && <p className="text-danger text-sm">⚠️ {errorMessage(create.error)}</p>}

        <Button
          type="submit"
          variant="primary"
          disabled={create.isPending || name.trim().length < 2}
        >
          {create.isPending ? 'Создаём…' : 'Создать'}
        </Button>
      </form>
    </Card>
  );
}
