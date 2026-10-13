import type { ParticipantClub } from '@/shared/api/types';
import { cn } from '@/shared/lib/cn';
import { assetUrl } from '@/shared/lib/asset';

/** Логотипы клубов лежат в public/ — путь приходит из каталога как есть. */
function iconUrl(icon: string) {
  return icon.startsWith('http') ? icon : assetUrl(icon);
}

export function ClubMark({ club, className }: { club?: ParticipantClub; className?: string }) {
  if (!club?.club) return null;

  return club.icon ? (
    <img src={iconUrl(club.icon)} alt="" className={cn('size-4 shrink-0 object-contain', className)} />
  ) : (
    <span aria-hidden className={cn('shrink-0 text-xs', className)}>
      {club.flag}
    </span>
  );
}

export function ClubBadge({ club, className }: { club?: ParticipantClub; className?: string }) {
  if (!club?.club) return null;

  return (
    <span className={cn('text-ink-dim mt-0.5 flex items-center gap-1 text-[0.65rem]', className)}>
      <ClubMark club={club} className="size-3" />
      <span className="truncate">{club.club}</span>
    </span>
  );
}
