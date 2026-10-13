import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Field';
import { ClubAutocomplete } from './ClubAutocomplete';
import { newParticipant, type ParticipantDraft } from './participantDraft';

export function ParticipantsEditor({
  rows,
  showClubs,
  onChange,
}: {
  rows: ParticipantDraft[];
  showClubs: boolean;
  onChange: (rows: ParticipantDraft[]) => void;
}) {
  function patch(key: string, changes: Partial<ParticipantDraft>) {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...changes } : row)));
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={row.key} className="flex items-center gap-2">
          <Input
            className="min-w-0 flex-1 basis-0"
            placeholder={`Участник ${index + 1}`}
            value={row.name}
            onChange={(event) => patch(row.key, { name: event.target.value })}
          />

          {showClubs && (
            <ClubAutocomplete value={row.club} onSelect={(club) => patch(row.key, { club })} />
          )}

          <Button
            variant="ghost"
            size="sm"
            aria-label="Убрать участника"
            disabled={rows.length <= 2}
            onClick={() => onChange(rows.filter((item) => item.key !== row.key))}
          >
            ✕
          </Button>
        </div>
      ))}

      <Button
        variant="secondary"
        className="border-brand/30 text-brand border-dashed"
        onClick={() => onChange([...rows, newParticipant()])}
      >
        + Добавить участника
      </Button>
    </div>
  );
}
