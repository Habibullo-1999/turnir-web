import { useState } from 'react';
import type { Role, User } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input, Select } from '@/shared/ui/Field';
import { Badge } from '@/shared/ui/Badge';
import { ConfirmDialog, Modal } from '@/shared/ui/Modal';
import { Table, TableScroll, Td, Th } from '@/shared/ui/Table';
import { ErrorState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { formatDate } from '@/shared/lib/date';
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from './api';

const ROLES: Array<{ value: Role; label: string }> = [
  { value: 'admin', label: 'Админ' },
  { value: 'organizer', label: 'Организатор' },
  { value: 'viewer', label: 'Наблюдатель' },
];

const ROLE_LABEL = Object.fromEntries(ROLES.map((role) => [role.value, role.label])) as Record<
  Role,
  string
>;

export function UsersPage() {
  const { data, isPending, isError, error, refetch } = useUsers();
  const update = useUpdateUser();
  const remove = useDeleteUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Card>
      <CardTitle
        action={
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            ＋ Добавить
          </Button>
        }
      >
        Пользователи
      </CardTitle>

      <TableScroll>
        <Table>
          <thead>
            <tr>
              <Th>Логин</Th>
              <Th>Имя</Th>
              <Th>E-mail</Th>
              <Th>Роль</Th>
              <Th>Статус</Th>
              <Th>Последний вход</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {data.items.map((user) => (
              <tr key={user.id}>
                <Td className="font-medium">{user.username}</Td>
                <Td>{user.displayName || '—'}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Select
                    className="w-auto py-1 text-xs"
                    value={user.role}
                    disabled={update.isPending}
                    onChange={(event) =>
                      update.mutate({ id: user.id, role: event.target.value as Role })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {ROLE_LABEL[role.value]}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <button
                    type="button"
                    disabled={update.isPending}
                    onClick={() => update.mutate({ id: user.id, isActive: !user.isActive })}
                  >
                    <Badge tone={user.isActive ? 'brand' : 'neutral'}>
                      {user.isActive ? 'Активен' : 'Отключён'}
                    </Badge>
                  </button>
                </Td>
                <Td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}</Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(user)}>
                    🗑
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>

      {update.isError && <p className="text-danger mt-3 text-sm">⚠️ {errorMessage(update.error)}</p>}

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }
        pending={remove.isPending}
        variant="danger"
        confirmLabel="Удалить"
        title="Удалить пользователя?"
        description={toDelete ? `Аккаунт «${toDelete.username}» будет удалён без возможности вернуть.` : undefined}
      />
    </Card>
  );
}

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateUser();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
    role: 'organizer' as Role,
  });

  const canSubmit = form.email && form.username.length >= 3 && form.password.length >= 8;

  function submit() {
    create.mutate(form, {
      onSuccess: () => {
        setForm({ email: '', username: '', password: '', displayName: '', role: 'organizer' });
        onClose();
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новый пользователь"
      footer={
        <>
          <Button variant="primary" className="flex-1" disabled={!canSubmit || create.isPending} onClick={submit}>
            {create.isPending ? 'Создаём…' : 'Создать'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="E-mail">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </Field>
        <Field label="Логин" hint="От 3 до 32 символов">
          <Input
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          />
        </Field>
        <Field label="Отображаемое имя" hint="Необязательно">
          <Input
            value={form.displayName}
            onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
          />
        </Field>
        <Field label="Пароль" hint="Минимум 8 символов">
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </Field>
        <Field label="Роль">
          <Select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </Field>

        {create.isError && <p className="text-danger text-sm">⚠️ {errorMessage(create.error)}</p>}
      </div>
    </Modal>
  );
}
