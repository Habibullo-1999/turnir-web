/**
 * Зеркало `internal/structs` бэкенда. Правя эти типы, сверяйтесь с Go:
 * OpenAPI-спеки нет, и рассинхрон компилятор не поймает.
 */

export type Role = 'admin' | 'organizer' | 'viewer';

/**
 * Роль внутри организации — отдельная от глобальной `Role`. Глобальная решает,
 * может ли человек вообще писать; эта — что он может в конкретной организации.
 */
export type OrgRole = 'owner' | 'admin' | 'member';

/** Владелец и админ организации: правят любой её турнир, зовут людей. */
export function canManageOrg(role: OrgRole | undefined): boolean {
  return role === 'owner' || role === 'admin';
}

export type Engine = 'bracket-group' | 'americano' | 'turnik-ladder' | 'team-match-log';

export type Format = 'playoff' | 'group' | 'group+playoff' | 'league';

export type TournamentStatus = 'active' | 'finished';

/** Победитель ничейного матча в «реальном футболе» — метка, а не участник. */
export const DRAW_LABEL = 'Ничья';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: Role;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  user?: User;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  /** Роль вызывающего — приходит в списке «мои организации». */
  role?: OrgRole;
  memberCount: number;
}

export interface OrganizationMember {
  orgId: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  role: OrgRole;
  playerId: string | null;
  playerName: string | null;
  joinedAt: string;
}

export interface OrganizationInvite {
  id: string;
  orgId: string;
  role: OrgRole;
  playerId: string | null;
  playerName: string | null;
  note: string;
  createdBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  /** Приходят один раз — в ответе на создание. Дальше в базе только хэш. */
  token?: string;
  url?: string;
}

/** Что видит приглашённый до входа: ничего, кроме названия организации. */
export interface InvitePreview {
  orgName: string;
  role: OrgRole;
  playerName?: string;
  expired: boolean;
  accepted: boolean;
}

export interface Sport {
  code: string;
  label: string;
  icon: string;
  engine: Engine;
  hasClub: boolean;
  hasPenalty: boolean;
  hasDraws: boolean;
  unitNoun: string;
  diffLabel: string;
  diffGenitive: string;
  doubleRoundRobinLeague: boolean;
  sortOrder: number;
}

export interface Club {
  id: string;
  name: string;
  league: string;
  flag: string;
  iconPath: string;
}

/** Снимок клуба на момент жеребьёвки — каталог потом может измениться. */
export interface ParticipantClub {
  clubId?: string;
  club: string;
  league: string;
  flag: string;
  icon: string;
}

export interface Participant {
  id: string;
  tournamentId: string;
  playerId: string;
  name: string;
  orderIdx: number;
  /** Из реестра игроков — нужен баннеру победителя. */
  avatarUrl: string;
  club?: ParticipantClub;
}

export interface ParticipantRef {
  participantId: string;
  name: string;
}

export interface GroupMatch {
  id: string;
  groupId: string;
  orderIdx: number;
  p1Id: string;
  p2Id: string;
  p1Name: string;
  p2Name: string;
  score1: number | null;
  score2: number | null;
  played: boolean;
  isHomeLeg: boolean;
}

export interface Group {
  id: string;
  tournamentId: string;
  name: string;
  orderIdx: number;
  participants: ParticipantRef[];
  matches: GroupMatch[];
}

export interface BracketMatch {
  id: string;
  roundId: string;
  roundIdx: number;
  orderIdx: number;
  p1Id: string | null;
  p2Id: string | null;
  p1Name: string | null;
  p2Name: string | null;
  /** Слот-пустышка для добивки сетки до степени двойки — это флаг, не имя «BYE». */
  p1IsBye: boolean;
  p2IsBye: boolean;
  p1Lucky: boolean;
  p2Lucky: boolean;
  score1: number | null;
  score2: number | null;
  pen1: number | null;
  pen2: number | null;
  winnerId: string | null;
  winnerName: string | null;
  winnerIsBye: boolean;
}

export interface BracketRound {
  id: string;
  tournamentId: string;
  roundIdx: number;
  label: string;
  matches: BracketMatch[];
}

export interface AmericanoMatch {
  id: string;
  roundId: string;
  roundIdx: number;
  orderIdx: number;
  score1: number | null;
  score2: number | null;
  played: boolean;
  sideA: ParticipantRef[];
  sideB: ParticipantRef[];
}

export interface AmericanoRound {
  id: string;
  tournamentId: string;
  roundIdx: number;
  matches: AmericanoMatch[];
  byes: ParticipantRef[];
}

export interface LadderAttempt {
  id: string;
  tournamentId: string;
  participantId: string;
  name: string;
  round: number;
  passed: boolean;
  reps: number | null;
}

export interface LadderRank {
  participantId: string;
  name: string;
  eliminatedRound: number | null;
  reps: number | null;
  totalReps: number;
  rank: number;
}

export interface Ladder {
  currentRound: number;
  attempts: LadderAttempt[];
  ranking: LadderRank[];
}

export interface MatchTeamPlayer {
  teamId: string;
  participantId: string;
  name: string;
  goals: number;
}

export interface MatchTeam {
  id: string;
  tournamentId: string;
  side: 0 | 1;
  name: string;
  score: number;
  players: MatchTeamPlayer[];
}

export interface StandingsRow {
  participantId: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
  points: number;
}

export interface Tournament {
  id: string;
  legacyId?: string;
  orgId: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  sport: string;
  engine: Engine;
  format?: Format;
  status: TournamentStatus;
  winner?: string;
  playedAt?: string;
  finishedAt?: string;
  publicSlug: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;

  participants?: Participant[];
  groups?: Group[];
  bracketRounds?: BracketRound[];
  americanoRounds?: AmericanoRound[];
  ladder?: Ladder;
  teams?: MatchTeam[];
  standings?: StandingsRow[];
}

export interface PlayerStats {
  playerId: string;
  name: string;
  tournaments: number;
  trophies: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
  points: number;
}

export interface ScorerStats {
  playerId: string;
  name: string;
  goals: number;
  matches: number;
}

export interface LadderStats {
  playerId: string;
  name: string;
  tournaments: number;
  gold: number;
  silver: number;
  bronze: number;
  bestRound: number;
  totalReps: number;
}

export interface PlayerProfile {
  id: string;
  orgId: string;
  name: string;
  userId?: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  stats?: PlayerStats;
}

/* ---------- Запросы ---------- */

export interface CreateParticipantInput {
  name: string;
  club?: ParticipantClub | null;
}

export interface CreateTournamentInput {
  /** Можно опустить, если пользователь состоит ровно в одной организации. */
  orgId?: string;
  name: string;
  sport: string;
  format?: Format;
  participants: CreateParticipantInput[];
}

export interface ScoreInput {
  score1?: number;
  score2?: number;
  pen1?: number;
  pen2?: number;
  clear?: boolean;
}

export interface LadderAttemptInput {
  participantId: string;
  passed: boolean;
  reps?: number;
}

export interface TeamMatchInput {
  playedAt?: number;
  teams: Array<{
    side: 0 | 1;
    name: string;
    score: number;
    players: Array<{ participantId: string; goals: number }>;
  }>;
}

export interface SwapBracketInput {
  matchAId: string;
  slotA: 1 | 2;
  matchBId: string;
  slotB: 1 | 2;
}

export interface MoveParticipantInput {
  participantId: string;
  targetGroupId: string;
}

export interface DrawClubsInput {
  league?: string;
  avoidPreviousTournament?: boolean;
}

export type TournamentListQuery = {
  org?: string;
  status?: TournamentStatus;
  sport?: string;
  owner?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type StatsQuery = {
  org?: string;
  sport?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/* ---------- Организации: запросы ---------- */

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
}

export interface CreateInviteInput {
  role?: OrgRole;
  /** Привязать к существующему игроку — тогда приглашённый получит его историю. */
  playerId?: string;
  /** Или создать профиль на месте. */
  playerName?: string;
  note?: string;
  ttlDays?: number;
}

export interface UpdateMemberInput {
  role?: OrgRole;
  /** Пустая строка отвязывает профиль; отсутствие поля оставляет как есть. */
  playerId?: string;
}

export interface MergePlayersInput {
  fromId: string;
  intoId: string;
}

export interface MergeResult {
  player: PlayerProfile;
  moved: number;
  /** Турниры, где играли оба: значит это разные люди, их не тронули. */
  conflicts: string[];
}

/** Ответ на запрос письма: при выключенной почте ссылка приходит сюда. */
export interface VerificationLink {
  sent: boolean;
  url?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  /** Смена почты снимает подтверждение и высылает новое письмо. */
  email?: string;
}

export interface UpdatePlayerInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}
