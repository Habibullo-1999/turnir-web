import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Field';
import { cn } from '@/shared/lib/cn';
import type { DrawPolicy } from '../model';

export interface ScoreEntryProps {
  drawPolicy: DrawPolicy;
  pending?: boolean;
  /** Вызывается с разным счётом либо с ничьёй, если она разрешена. */
  onSubmit: (score1: number, score2: number) => void;
  /** Ничья при `drawPolicy: 'penalty'` — экран должен спросить серию. */
  onPenaltyNeeded?: (score1: number, score2: number) => void;
  className?: string;
  compact?: boolean;
}

function parseScore(raw: string): number | null {
  if (raw.trim() === '') return 0;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 99 ? value : null;
}

/**
 * Ввод счёта — один компонент на все движки: и группы, и сетка, и американо
 * вводят счёт одинаково, различаются только правилом про ничью.
 */
export function ScoreEntry({
  drawPolicy,
  pending,
  onSubmit,
  onPenaltyNeeded,
  className,
  compact,
}: ScoreEntryProps) {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const score1 = parseScore(left);
    const score2 = parseScore(right);

    if (score1 === null || score2 === null) {
      setError('Счёт — целое число от 0 до 99.');
      return;
    }

    if (score1 === score2) {
      if (drawPolicy === 'penalty') {
        setError(null);
        onPenaltyNeeded?.(score1, score2);
        return;
      }
      if (drawPolicy === 'reject') {
        setError('Ничья невозможна — введите разные значения.');
        return;
      }
    }

    setError(null);
    onSubmit(score1, score2);
  }

  const inputClass = cn(
    'text-center font-bold tabular-nums',
    compact ? 'w-12 px-1 py-1 text-sm' : 'w-14 px-2 py-1.5',
  );

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          placeholder="0"
          aria-label="Счёт слева"
          className={inputClass}
          value={left}
          onChange={(event) => setLeft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
        />
        <span className="text-ink-dim text-sm">:</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          placeholder="0"
          aria-label="Счёт справа"
          className={inputClass}
          value={right}
          onChange={(event) => setRight(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
        />
      </div>

      {error && <p className="text-danger text-center text-xs">{error}</p>}

      <Button variant="primary" size="sm" disabled={pending} onClick={submit}>
        {pending ? 'Сохраняем…' : 'Подтвердить ✓'}
      </Button>
    </div>
  );
}
