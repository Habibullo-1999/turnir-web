import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type {
  CreateTournamentInput,
  DrawClubsInput,
  LadderAttemptInput,
  MoveParticipantInput,
  ScoreInput,
  SwapBracketInput,
  TeamMatchInput,
  Tournament,
  TournamentListQuery,
} from '@/shared/api/types';
import { tournamentsApi } from './api';

export const tournamentKeys = {
  all: ['tournaments'] as const,
  list: (query: TournamentListQuery) => ['tournaments', 'list', query] as const,
  detail: (id: string) => ['tournaments', 'detail', id] as const,
  public: (slug: string) => ['tournaments', 'public', slug] as const,
};

/**
 * Ответ пишущего запроса — это уже полный новый турнир. Кладём его в кеш
 * напрямую: перезапрашивать нечего, гонок «кто ответил последним» не будет.
 */
function commitTournament(queryClient: QueryClient, tournament: Tournament) {
  queryClient.setQueryData(tournamentKeys.detail(tournament.id), tournament);
  queryClient.setQueryData(tournamentKeys.public(tournament.publicSlug), tournament);
  // Списки показывают статус и счётчики — они устарели.
  void queryClient.invalidateQueries({ queryKey: tournamentKeys.all, type: 'active' });
  // Сквозная статистика меняется с каждым сыгранным матчем.
  void queryClient.invalidateQueries({ queryKey: ['stats'] });
}

export function useTournaments(query: TournamentListQuery) {
  return useQuery({
    queryKey: tournamentKeys.list(query),
    queryFn: () => tournamentsApi.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useTournament(id: string | undefined) {
  return useQuery({
    queryKey: tournamentKeys.detail(id!),
    queryFn: () => tournamentsApi.get(id!),
    enabled: Boolean(id),
  });
}

/** Публичная страница: живёт по слагу и сама подтягивает свежий счёт. */
export function usePublicTournament(slug: string | undefined, refetchInterval: number | false) {
  return useQuery({
    queryKey: tournamentKeys.public(slug!),
    queryFn: () => tournamentsApi.getPublic(slug!),
    enabled: Boolean(slug),
    refetchInterval,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTournamentInput) => tournamentsApi.create(input),
    onSuccess: (tournament) => commitTournament(queryClient, tournament),
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentsApi.remove(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: tournamentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
    },
  });
}

/** Общая обвязка для любого действия: ответ становится новым состоянием. */
function useTournamentMutation<TInput>(mutationFn: (input: TInput) => Promise<Tournament>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (tournament) => commitTournament(queryClient, tournament),
  });
}

/**
 * Все правки одного турнира — одним объектом, чтобы компоненты доски не знали
 * ни про кеш, ни про пути эндпоинтов.
 */
export function useTournamentActions(id: string) {
  return {
    rename: useTournamentMutation((input: { name?: string; playedAt?: number }) =>
      tournamentsApi.update(id, input),
    ),
    finish: useTournamentMutation(() => tournamentsApi.finish(id)),
    reopen: useTournamentMutation(() => tournamentsApi.reopen(id)),

    setGroupScore: useTournamentMutation((input: MatchScore) =>
      tournamentsApi.updateGroupMatch(id, input.matchId, input.score),
    ),
    setBracketScore: useTournamentMutation((input: MatchScore) =>
      tournamentsApi.updateBracketMatch(id, input.matchId, input.score),
    ),
    setAmericanoScore: useTournamentMutation((input: MatchScore) =>
      tournamentsApi.updateAmericanoMatch(id, input.matchId, input.score),
    ),

    advanceToPlayoff: useTournamentMutation(() => tournamentsApi.advanceToPlayoff(id)),

    recordLadderAttempt: useTournamentMutation((input: LadderAttemptInput) =>
      tournamentsApi.recordLadderAttempt(id, input),
    ),
    advanceLadder: useTournamentMutation(() => tournamentsApi.advanceLadder(id)),

    saveTeamMatch: useTournamentMutation((input: TeamMatchInput) =>
      tournamentsApi.updateTeamMatch(id, input),
    ),

    swapBracketSlots: useTournamentMutation((input: SwapBracketInput) =>
      tournamentsApi.swapBracketSlots(id, input),
    ),
    moveParticipant: useTournamentMutation((input: MoveParticipantInput) =>
      tournamentsApi.moveParticipant(id, input),
    ),
    drawClubs: useTournamentMutation((input: DrawClubsInput) =>
      tournamentsApi.drawClubs(id, input),
    ),
  };
}

export interface MatchScore {
  matchId: string;
  score: ScoreInput;
}

export type TournamentActions = ReturnType<typeof useTournamentActions>;
