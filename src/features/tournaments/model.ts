import {
  DRAW_LABEL,
  type BracketMatch,
  type Group,
  type GroupMatch,
  type Ladder,
  type MatchTeam,
  type Participant,
  type ParticipantClub,
  type ParticipantRef,
  type StandingsRow,
  type Tournament,
} from '@/shared/api/types';

/** Быстрый доступ к участнику по id — в матчах приходят только id и имена. */
export function participantsById(tournament: Tournament): Map<string, Participant> {
  return new Map((tournament.participants ?? []).map((p) => [p.id, p]));
}

/** Клубы разложены по имени участника: в матчах клуба нет, только имя. */
export function clubsByName(tournament: Tournament): Map<string, ParticipantClub> {
  const entries = (tournament.participants ?? [])
    .filter((p): p is Participant & { club: ParticipantClub } => Boolean(p.club))
    .map((p) => [p.name, p.club] as const);
  return new Map(entries);
}

export interface BracketSlot {
  name: string | null;
  isBye: boolean;
  isLucky: boolean;
  score: number | null;
  pen: number | null;
  isWinner: boolean;
}

/** Разбирает матч сетки на две стороны — вся логика «кто где» в одном месте. */
export function bracketSlots(match: BracketMatch): [BracketSlot, BracketSlot] {
  const decided = Boolean(match.winnerId) || match.winnerIsBye;

  return [
    {
      name: match.p1Name,
      isBye: match.p1IsBye,
      isLucky: match.p1Lucky,
      score: match.score1,
      pen: match.pen1,
      isWinner: decided && match.winnerId != null && match.winnerId === match.p1Id,
    },
    {
      name: match.p2Name,
      isBye: match.p2IsBye,
      isLucky: match.p2Lucky,
      score: match.score2,
      pen: match.pen2,
      isWinner: decided && match.winnerId != null && match.winnerId === match.p2Id,
    },
  ];
}

/** Матч готов к вводу счёта: обе стороны — живые участники, счёта ещё нет. */
export function isBracketMatchPlayable(match: BracketMatch): boolean {
  return (
    !match.winnerId &&
    !match.winnerIsBye &&
    !match.p1IsBye &&
    !match.p2IsBye &&
    Boolean(match.p1Id) &&
    Boolean(match.p2Id)
  );
}

export function isBracketMatchDecided(match: BracketMatch): boolean {
  return Boolean(match.winnerId) || match.winnerIsBye;
}

/** Перестановки в сетке разрешены только до первого результата. */
export function hasBracketStarted(tournament: Tournament): boolean {
  return (tournament.bracketRounds ?? []).some((round) =>
    round.matches.some((match) => match.score1 != null || match.score2 != null),
  );
}

export function hasGroupsStarted(tournament: Tournament): boolean {
  return (tournament.groups ?? []).some((group) => group.matches.some((match) => match.played));
}

export function allGroupMatchesPlayed(tournament: Tournament): boolean {
  const groups = tournament.groups ?? [];
  return groups.length > 0 && groups.every((group) => group.matches.every((m) => m.played));
}

/** Сколько человек из группы проходят дальше — правило перенесено из ../turnir. */
export function advanceCount(tournament: Tournament): number {
  if (tournament.format !== 'group+playoff') return 0;
  const first = tournament.groups?.[0];
  if (!first) return 0;
  return Math.min(2, Math.floor(first.participants.length / 2) + 1);
}

export function pairLabel(side: ParticipantRef[]): string {
  return side.map((p) => p.name).join(' / ');
}

/* ---------- Турник ---------- */

export interface LadderView {
  round: number;
  active: Array<{ participantId: string; name: string; passed: boolean; reps: number | null }>;
  eliminated: Array<{ participantId: string; name: string; eliminatedRound: number; reps: number | null; rank: number }>;
  allMarked: boolean;
}

/**
 * Лестница: кто ещё в игре и отмечен ли он в текущем раунде. Отметки берутся
 * из попыток именно этого раунда — история прошлых раундов сохраняется.
 */
export function ladderView(ladder: Ladder | undefined): LadderView {
  if (!ladder) return { round: 1, active: [], eliminated: [], allMarked: false };

  const roundAttempts = new Map(
    ladder.attempts
      .filter((attempt) => attempt.round === ladder.currentRound)
      .map((attempt) => [attempt.participantId, attempt]),
  );

  const active = ladder.ranking
    .filter((row) => row.eliminatedRound == null)
    .map((row) => {
      const attempt = roundAttempts.get(row.participantId);
      return {
        participantId: row.participantId,
        name: row.name,
        passed: attempt?.passed ?? false,
        reps: attempt?.reps ?? null,
      };
    });

  const eliminated = ladder.ranking
    .filter((row) => row.eliminatedRound != null)
    .map((row) => ({
      participantId: row.participantId,
      name: row.name,
      eliminatedRound: row.eliminatedRound as number,
      reps: row.reps,
      rank: row.rank,
    }));

  return {
    round: ladder.currentRound,
    active,
    eliminated,
    // Раунд закрывается только когда отмечены все оставшиеся — это же
    // проверяет бэкенд, здесь лишь гасим кнопку заранее.
    allMarked: active.length > 0 && active.every((row) => roundAttempts.has(row.participantId)),
  };
}

/* ---------- Реальный футбол ---------- */

export function teamsBySide(tournament: Tournament): [MatchTeam | undefined, MatchTeam | undefined] {
  const teams = tournament.teams ?? [];
  return [teams.find((team) => team.side === 0), teams.find((team) => team.side === 1)];
}

export function attributedGoals(team: MatchTeam | undefined): number {
  return (team?.players ?? []).reduce((sum, player) => sum + player.goals, 0);
}

export interface MatchOutcome {
  isDraw: boolean;
  winnerName: string | null;
  topScorer: { name: string; goals: number } | null;
}

export function matchOutcome(tournament: Tournament): MatchOutcome {
  const [home, away] = teamsBySide(tournament);
  const homeScore = home?.score ?? 0;
  const awayScore = away?.score ?? 0;

  const scorers = [...(home?.players ?? []), ...(away?.players ?? [])]
    .filter((player) => player.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  return {
    isDraw: homeScore === awayScore,
    winnerName: homeScore === awayScore ? DRAW_LABEL : homeScore > awayScore ? (home?.name ?? null) : (away?.name ?? null),
    topScorer: scorers[0] ? { name: scorers[0].name, goals: scorers[0].goals } : null,
  };
}

/** Игроки, не попавшие ни в одну команду, — матч ещё не разделён. */
export function isTeamMatchSplit(tournament: Tournament): boolean {
  const [home, away] = teamsBySide(tournament);
  return Boolean(home?.players.length && away?.players.length);
}

/* ---------- Таблица и расписание групп ---------- */

/**
 * Бэкенд отдаёт одну общую таблицу на турнир (по ней определяется чемпион).
 * Таблица конкретной группы — её подмножество: порядок сортировки общий,
 * поэтому фильтрация сохраняет правильные места.
 */
export function groupStandings(tournament: Tournament, group: Group): StandingsRow[] {
  const members = new Set(group.participants.map((p) => p.participantId));
  return (tournament.standings ?? []).filter((row) => members.has(row.participantId));
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Раскладывает матчи группы по турам круговой системой Бергера: соперники
 * вращаются вокруг первого участника. Это чисто отображение — бэкенд хранит
 * матчи одним списком, а читать их удобнее турами, как в ../turnir.
 */
export function scheduleTours(group: Group): GroupMatch[][] {
  const ids: Array<string | null> = group.participants.map((p) => p.participantId);
  if (ids.length % 2 !== 0) ids.push(null);

  const size = ids.length;
  if (size < 2) return group.matches.length ? [group.matches] : [];

  const pool = new Map<string, GroupMatch[]>();
  for (const match of group.matches) {
    const key = pairKey(match.p1Id, match.p2Id);
    const bucket = pool.get(key);
    if (bucket) bucket.push(match);
    else pool.set(key, [match]);
  }

  const tours: GroupMatch[][] = [];
  const rotating = ids.slice(1);
  let remaining = group.matches.length;

  // Второй круг лиги укладывается во второй проход того же вращения.
  while (remaining > 0 && tours.length < group.matches.length) {
    const pairs: Array<[string | null, string | null]> = [[ids[0], rotating[0]]];
    for (let i = 1; i < size / 2; i += 1) {
      pairs.push([rotating[i], rotating[size - 1 - i]]);
    }

    const tour: GroupMatch[] = [];
    for (const [left, right] of pairs) {
      if (!left || !right) continue;
      const match = pool.get(pairKey(left, right))?.shift();
      if (match) {
        tour.push(match);
        remaining -= 1;
      }
    }

    if (tour.length) tours.push(tour);
    rotating.push(rotating.shift() as string | null);
  }

  return tours;
}

/* ---------- Правило ничьей ---------- */

/** Что делать с равным счётом — свойство вида спорта, а не экрана. */
export type DrawPolicy = 'allow' | 'reject' | 'penalty';

/**
 * В плей-офф ничья допустима только вместе с серией пенальти и только там, где
 * серия предусмотрена; в группах — если вид спорта вообще знает ничьи.
 */
export function drawPolicyFor(options: {
  hasDraws: boolean;
  hasPenalty: boolean;
  isKnockout: boolean;
}): DrawPolicy {
  if (options.isKnockout) return options.hasPenalty ? 'penalty' : 'reject';
  return options.hasDraws ? 'allow' : 'reject';
}

/* ---------- Связь участника с игроком реестра ---------- */

/**
 * `participantId` живёт только внутри турнира, а профиль открывается по
 * сквозному `playerId`. В матчах приходит первый, поэтому нужна карта.
 */
export function playerIdByParticipant(tournament: Tournament): Map<string, string> {
  return new Map((tournament.participants ?? []).map((p) => [p.id, p.playerId]));
}
