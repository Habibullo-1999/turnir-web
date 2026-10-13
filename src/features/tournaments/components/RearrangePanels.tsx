import { useMemo, useState } from 'react';
import type { SwapBracketInput, Tournament } from '@/shared/api/types';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Field';

interface SlotOption {
  /** `matchId:slot` — ровно то, что нужно бэкенду для обмена. */
  key: string;
  name: string;
  matchId: string;
  slot: 1 | 2;
}

function firstRoundSlots(tournament: Tournament): SlotOption[] {
  const first = tournament.bracketRounds?.[0];
  if (!first) return [];

  return first.matches.flatMap<SlotOption>((match) => [
    ...(match.p1Id && !match.p1IsBye
      ? [{ key: `${match.id}:1`, name: match.p1Name ?? '', matchId: match.id, slot: 1 as const }]
      : []),
    ...(match.p2Id && !match.p2IsBye
      ? [{ key: `${match.id}:2`, name: match.p2Name ?? '', matchId: match.id, slot: 2 as const }]
      : []),
  ]);
}

/** Обмен местами в первом раунде — до первого результата. */
export function BracketSwapPanel({
  tournament,
  pending,
  onSwap,
}: {
  tournament: Tournament;
  pending?: boolean;
  onSwap: (input: SwapBracketInput) => void;
}) {
  const slots = useMemo(() => firstRoundSlots(tournament), [tournament]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  if (slots.length < 2) return null;

  const canSwap = from !== '' && to !== '' && from !== to;

  function swap() {
    const a = slots.find((slot) => slot.key === from);
    const b = slots.find((slot) => slot.key === to);
    if (!a || !b) return;

    onSwap({ matchAId: a.matchId, slotA: a.slot, matchBId: b.matchId, slotB: b.slot });
    setFrom('');
    setTo('');
  }

  return (
    <Panel title="🔁 Поменять участников местами в сетке">
      <Select className="w-auto min-w-40 flex-1" value={from} onChange={(event) => setFrom(event.target.value)}>
        <option value="">Кого…</option>
        {slots.map((slot) => (
          <option key={slot.key} value={slot.key}>
            {slot.name}
          </option>
        ))}
      </Select>

      <span className="text-ink-dim">⇄</span>

      <Select className="w-auto min-w-40 flex-1" value={to} onChange={(event) => setTo(event.target.value)}>
        <option value="">С кем…</option>
        {slots
          .filter((slot) => slot.key !== from)
          .map((slot) => (
            <option key={slot.key} value={slot.key}>
              {slot.name}
            </option>
          ))}
      </Select>

      <Button variant="secondary" disabled={!canSwap || pending} onClick={swap}>
        Поменять
      </Button>
    </Panel>
  );
}

/** Перенос участника в другую группу — тоже только до первого результата. */
export function GroupMovePanel({
  tournament,
  pending,
  onMove,
}: {
  tournament: Tournament;
  pending?: boolean;
  onMove: (input: { participantId: string; targetGroupId: string }) => void;
}) {
  const groups = tournament.groups ?? [];
  const [participantId, setParticipantId] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');

  if (groups.length < 2) return null;

  const currentGroupId = groups.find((group) =>
    group.participants.some((p) => p.participantId === participantId),
  )?.id;

  function move() {
    if (!participantId || !targetGroupId) return;
    onMove({ participantId, targetGroupId });
    setParticipantId('');
    setTargetGroupId('');
  }

  return (
    <Panel title="🔁 Переместить игрока между группами">
      <Select
        className="w-auto min-w-40 flex-1"
        value={participantId}
        onChange={(event) => {
          setParticipantId(event.target.value);
          setTargetGroupId('');
        }}
      >
        <option value="">Игрок…</option>
        {groups.map((group) => (
          <optgroup key={group.id} label={group.name}>
            {group.participants.map((participant) => (
              <option key={participant.participantId} value={participant.participantId}>
                {participant.name}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>

      <span className="text-ink-dim">→</span>

      <Select
        className="w-auto min-w-40 flex-1"
        value={targetGroupId}
        disabled={!participantId}
        onChange={(event) => setTargetGroupId(event.target.value)}
      >
        <option value="">В группу…</option>
        {groups
          .filter((group) => group.id !== currentGroupId)
          .map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
      </Select>

      <Button variant="secondary" disabled={!participantId || !targetGroupId || pending} onClick={move}>
        Переместить
      </Button>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-line bg-surface rounded-xl border p-3">
      <div className="text-ink-muted mb-2 text-xs font-semibold">{title}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
