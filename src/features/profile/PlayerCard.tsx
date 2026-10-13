import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input } from '@/shared/ui/Field';
import { EmptyState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { AvatarPicker } from '@/features/players/AvatarPicker';
import { useUpdatePlayer } from '@/features/players/api';
import { useMyPlayer } from './myPlayer';

/**
 * Профиль игрока, привязанный к учётке. Он свой в каждой организации, поэтому
 * карточка всегда говорит, о какой именно идёт речь.
 */
export function PlayerCard() {
  const { organization, playerId, player, isUnlinked, isPending } = useMyPlayer();
  const update = useUpdatePlayer();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  // Профиль приезжает асинхронно, а поля — локальные: синхронизируем, когда он
  // (или организация) сменился.
  useEffect(() => {
    setName(player?.name ?? '');
    setBio(player?.bio ?? '');
  }, [player?.id, player?.name, player?.bio]);

  if (isPending) return <LoadingState />;

  if (isUnlinked || !playerId || !player) {
    return (
      <Card>
        <CardTitle>Профиль игрока</CardTitle>
        <EmptyState>
          В организации «{organization?.name}» за вашей учёткой не закреплён игрок.
          Попросите владельца связать вас — тогда здесь появятся ваши результаты.
        </EmptyState>
      </Card>
    );
  }

  const changed = name.trim() !== player.name || bio.trim() !== player.bio;

  return (
    <Card>
      <CardTitle
        action={
          <Link to={`/players/${playerId}`} className="text-ink-muted hover:text-brand text-xs">
            Открыть профиль →
          </Link>
        }
      >
        Игрок в «{organization?.name}»
      </CardTitle>

      <div className="flex flex-col gap-5">
        <AvatarPicker playerId={playerId} name={player.name} avatarUrl={player.avatarUrl} />

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate({ id: playerId, name: name.trim(), bio: bio.trim() });
          }}
        >
          <Field label="Имя" hint="Под ним вас записывают в турниры">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <Field label="О себе" hint="Необязательно">
            <Input value={bio} onChange={(event) => setBio(event.target.value)} />
          </Field>

          {update.isError && <p className="text-danger text-sm">⚠️ {errorMessage(update.error)}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={!changed || !name.trim() || update.isPending}
          >
            {update.isPending ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
