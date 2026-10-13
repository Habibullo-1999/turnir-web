import { useSession } from '@/features/auth/session';
import { useActiveOrg } from '@/features/organizations/activeOrg';
import { useMembers } from '@/features/organizations/queries';
import { usePlayerProfile } from '@/features/players/api';

/**
 * Профиль игрока, которым владеет вошедший. Связь живёт в составе организации,
 * и она своя у каждой: в одной компании человек «Хабиб», в другой его может не
 * быть вовсе.
 */
export function useMyPlayer() {
  const { user } = useSession();
  const { active, orgId, isPending: orgPending } = useActiveOrg();
  const { data: members, isPending: membersPending } = useMembers(orgId);

  const membership = members?.find((member) => member.userId === user?.id);
  const playerId = membership?.playerId ?? undefined;

  const { data: player, isPending: playerPending } = usePlayerProfile(playerId);

  return {
    organization: active,
    playerId,
    player,
    /** Учётка есть, а профиля игрока в этой организации за ней не закреплено. */
    isUnlinked: !orgPending && !membersPending && Boolean(orgId) && !playerId,
    isPending: orgPending || membersPending || (Boolean(playerId) && playerPending),
  };
}
