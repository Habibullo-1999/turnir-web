import { api } from '@/shared/api/http';
import type {
  CreateTournamentInput,
  DrawClubsInput,
  LadderAttemptInput,
  MoveParticipantInput,
  Page,
  ScoreInput,
  SwapBracketInput,
  TeamMatchInput,
  Tournament,
  TournamentListQuery,
} from '@/shared/api/types';

/**
 * Каждый пишущий запрос возвращает турнир целиком — с пересчитанной таблицей
 * и актуальным статусом. Поэтому ни один метод здесь не отдаёт void: ответ
 * кладётся в кеш и становится новым состоянием экрана.
 */
export const tournamentsApi = {
  list: (query: TournamentListQuery) => api.get<Page<Tournament>>('/tournaments', { query }),

  get: (id: string) => api.get<Tournament>(`/tournaments/${id}`),

  getPublic: (slug: string) => api.get<Tournament>(`/public/tournaments/${slug}`),

  create: (input: CreateTournamentInput) => api.post<Tournament>('/tournaments', input),

  update: (id: string, input: { name?: string; playedAt?: number }) =>
    api.patch<Tournament>(`/tournaments/${id}`, input),

  remove: (id: string) => api.delete<null>(`/tournaments/${id}`),

  finish: (id: string) => api.post<Tournament>(`/tournaments/${id}/finish`),

  reopen: (id: string) => api.post<Tournament>(`/tournaments/${id}/reopen`),

  updateGroupMatch: (id: string, matchId: string, input: ScoreInput) =>
    api.patch<Tournament>(`/tournaments/${id}/group-matches/${matchId}`, input),

  updateBracketMatch: (id: string, matchId: string, input: ScoreInput) =>
    api.patch<Tournament>(`/tournaments/${id}/bracket-matches/${matchId}`, input),

  updateAmericanoMatch: (id: string, matchId: string, input: ScoreInput) =>
    api.patch<Tournament>(`/tournaments/${id}/americano-matches/${matchId}`, input),

  advanceToPlayoff: (id: string) => api.post<Tournament>(`/tournaments/${id}/advance-to-playoff`),

  recordLadderAttempt: (id: string, input: LadderAttemptInput) =>
    api.post<Tournament>(`/tournaments/${id}/ladder/attempts`, input),

  advanceLadder: (id: string) => api.post<Tournament>(`/tournaments/${id}/ladder/advance`),

  updateTeamMatch: (id: string, input: TeamMatchInput) =>
    api.patch<Tournament>(`/tournaments/${id}/team-match`, input),

  swapBracketSlots: (id: string, input: SwapBracketInput) =>
    api.post<Tournament>(`/tournaments/${id}/bracket/swap`, input),

  moveParticipant: (id: string, input: MoveParticipantInput) =>
    api.post<Tournament>(`/tournaments/${id}/groups/move`, input),

  drawClubs: (id: string, input: DrawClubsInput) =>
    api.post<Tournament>(`/tournaments/${id}/draw-clubs`, input),
};
