import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Format } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Field, Input } from '@/shared/ui/Field';
import { ToggleGroup } from '@/shared/ui/Toggle';
import { Badge } from '@/shared/ui/Badge';
import { ErrorState, LoadingState } from '@/shared/ui/StateView';
import { errorMessage } from '@/shared/api/http';
import { FORMAT_OPTIONS } from '@/features/catalog/labels';
import { useSport } from '@/features/catalog/api';
import { usePlayers } from '@/features/players/api';
import { useActiveOrg } from '@/features/organizations/activeOrg';
import { ParticipantsEditor } from '../components/ParticipantsEditor';
import { newParticipant, type ParticipantDraft } from '../components/participantDraft';
import { useCreateTournament } from '../queries';

/** Минимум участников зависит от движка — те же числа проверяет бэкенд. */
const MIN_PARTICIPANTS: Record<string, number> = {
  'bracket-group': 2,
  'turnik-ladder': 2,
  americano: 3,
  'team-match-log': 4,
};

const HINTS: Record<string, string> = {
  'bracket-group': 'Минимум 2 участника. Лучший проигравший займёт пустой слот в сетке.',
  'turnik-ladder': 'Минимум 2 участника. Каждый раунд планка выше на одно подтягивание.',
  americano: 'Минимум 3 участника. Пары формируются автоматически и меняются каждый раунд.',
  'team-match-log':
    'Минимум 4 игрока. Пришедшие сразу делятся на две команды; при нечётном числе лишний усиливает случайную. Составы потом можно поправить.',
};

export function CreateTournamentPage() {
  const { sportCode } = useParams<{ sportCode: string }>();
  const navigate = useNavigate();

  const { orgId } = useActiveOrg();
  const { data: sport, isPending, isError, error, refetch } = useSport(sportCode);
  const create = useCreateTournament();
  const { data: knownPlayers } = usePlayers({ org: orgId, pageSize: 50 });

  const [name, setName] = useState('');
  const [format, setFormat] = useState<Format>('playoff');
  const [rows, setRows] = useState<ParticipantDraft[]>([newParticipant(), newParticipant()]);

  const minParticipants = sport ? (MIN_PARTICIPANTS[sport.engine] ?? 2) : 2;

  // Смена вида спорта меняет минимум — открываем сразу нужное число полей.
  useEffect(() => {
    setRows(Array.from({ length: minParticipants }, () => newParticipant()));
  }, [minParticipants]);

  const filled = useMemo(
    () => rows.map((row) => row.name.trim()).filter(Boolean),
    [rows],
  );

  const duplicate = useMemo(() => {
    const seen = new Set<string>();
    return filled.find((candidate) => {
      const key = candidate.toLocaleLowerCase('ru-RU');
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
  }, [filled]);

  if (isPending) return <LoadingState text="Загружаем виды спорта…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!sport) {
    return (
      <Card className="text-ink-muted text-center">
        Неизвестный вид спорта.{' '}
        <Link to="/create" className="text-brand hover:underline">
          Выбрать другой
        </Link>
      </Card>
    );
  }

  const isMatch = sport.engine === 'team-match-log';
  const canSubmit = filled.length >= minParticipants && !duplicate;

  function addKnownPlayer(playerName: string) {
    setRows((prev) => {
      if (prev.some((row) => row.name.trim() === playerName)) return prev;

      const emptyIndex = prev.findIndex((row) => !row.name.trim());
      if (emptyIndex < 0) return [...prev, newParticipant(playerName)];
      return prev.map((row, index) => (index === emptyIndex ? { ...row, name: playerName } : row));
    });
  }

  function submit() {
    create.mutate(
      {
        orgId,
        name: name.trim(),
        sport: sport!.code,
        ...(sport!.engine === 'bracket-group' ? { format } : {}),
        participants: rows
          .filter((row) => row.name.trim())
          .map((row) => ({ name: row.name.trim(), club: row.club })),
      },
      { onSuccess: (tournament) => navigate(`/tournaments/${tournament.id}`) },
    );
  }

  const unusedPlayers = (knownPlayers?.items ?? []).filter(
    (player) => !filled.includes(player.name),
  );

  return (
    <div className="flex flex-col gap-4">
      <Link to="/create" className="text-ink-muted hover:text-ink text-sm">
        ← Сменить вид спорта
      </Link>

      <Card>
        <CardTitle>
          {sport.icon} {isMatch ? 'Новый матч' : 'Новый турнир'} · {sport.label}
        </CardTitle>

        <div className="flex flex-col gap-5">
          <Field label="Название">
            <Input
              autoFocus
              placeholder={isMatch ? 'Например: Среда, поле у школы' : 'Например: Летний кубок 2026'}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted text-xs font-medium">Участники</span>
              <Badge tone={filled.length >= minParticipants ? 'brand' : 'neutral'}>
                {filled.length} {sport.unitNoun}
              </Badge>
            </div>

            <ParticipantsEditor rows={rows} showClubs={sport.hasClub} onChange={setRows} />

            {duplicate ? (
              <p className="text-danger text-xs">
                Имя «{duplicate}» повторяется — участники должны различаться.
              </p>
            ) : (
              <p className="text-ink-dim text-xs">{HINTS[sport.engine]}</p>
            )}
          </div>

          {unusedPlayers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-ink-dim text-xs">Уже играли — нажмите, чтобы добавить:</span>
              <div className="flex flex-wrap gap-1.5">
                {unusedPlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => addKnownPlayer(player.name)}
                    className="border-line bg-surface text-ink-muted hover:border-brand-dim hover:text-ink rounded-full border px-2.5 py-1 text-xs transition-colors"
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sport.engine === 'bracket-group' && (
            <div className="flex flex-col gap-2">
              <span className="text-ink-muted text-xs font-medium">Формат</span>
              <ToggleGroup options={FORMAT_OPTIONS} value={format} onChange={setFormat} />
            </div>
          )}

          {create.isError && <p className="text-danger text-sm">⚠️ {errorMessage(create.error)}</p>}

          <Button variant="primary" size="lg" disabled={!canSubmit || create.isPending} onClick={submit}>
            {create.isPending ? 'Создаём…' : isMatch ? '⚡ Создать матч' : '⚡ Создать турнир'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
