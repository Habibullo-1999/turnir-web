import { useEffect, useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Field';

export interface PenaltyContext {
  matchId: string;
  score1: number;
  score2: number;
  name1: string;
  name2: string;
}

/**
 * Ничья в плей-офф принимается только вместе с серией — бэкенд иначе ответит
 * 400. Раньше фронтенд молча присуждал победу второму участнику.
 */
export function PenaltyDialog({
  context,
  pending,
  onConfirm,
  onClose,
}: {
  context: PenaltyContext | null;
  pending?: boolean;
  onConfirm: (pen1: number, pen2: number) => void;
  onClose: () => void;
}) {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (context) {
      setLeft('');
      setRight('');
      setError(null);
    }
  }, [context]);

  function submit() {
    const pen1 = Number(left || '0');
    const pen2 = Number(right || '0');

    if (!Number.isInteger(pen1) || !Number.isInteger(pen2) || pen1 < 0 || pen2 < 0) {
      setError('Введите целые числа.');
      return;
    }
    if (pen1 === pen2) {
      setError('Пенальти тоже равны — серия продолжается, введите итоговые числа.');
      return;
    }

    setError(null);
    onConfirm(pen1, pen2);
  }

  return (
    <Modal
      open={Boolean(context)}
      onClose={onClose}
      title="⚽ Серия пенальти"
      subtitle={
        context ? `Основное время ${context.score1} : ${context.score2} — победителя определяют пенальти.` : undefined
      }
      footer={
        <>
          <Button variant="primary" className="flex-1" disabled={pending} onClick={submit}>
            {pending ? 'Сохраняем…' : 'Подтвердить ✓'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </>
      }
    >
      {context && (
        <div className="flex flex-col gap-3">
          <Row name={context.name1} value={left} onChange={setLeft} autoFocus />
          <Row name={context.name2} value={right} onChange={setRight} />
          {error && <p className="text-danger text-sm">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

function Row({
  name,
  value,
  onChange,
  autoFocus,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="bg-surface border-line flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <span className="text-ink truncate text-sm font-medium">{name}</span>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        placeholder="0"
        autoFocus={autoFocus}
        className="w-16 text-center font-bold tabular-nums"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
