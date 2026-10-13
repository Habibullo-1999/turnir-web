import type { ParticipantClub } from '@/shared/api/types';

export interface ParticipantDraft {
  /** Локальный ключ строки: имена меняются и повторяются, id ещё нет. */
  key: string;
  name: string;
  club: ParticipantClub | null;
}

let nextKey = 0;

export function newParticipant(name = '', club: ParticipantClub | null = null): ParticipantDraft {
  nextKey += 1;
  return { key: `p${nextKey}`, name, club };
}
