import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

/**
 * Имя участника ведёт на его профиль. Участник турнира и игрок реестра — разные
 * сущности: `participantId` живёт внутри турнира, `playerId` — сквозной.
 */
export function PlayerLink({
  playerId,
  name,
  className,
}: {
  playerId: string | undefined;
  name: string;
  className?: string;
}) {
  if (!playerId) return <span className={className}>{name}</span>;

  return (
    <Link
      to={`/players/${playerId}`}
      className={cn('hover:text-brand hover:underline', className)}
      onClick={(event) => event.stopPropagation()}
    >
      {name}
    </Link>
  );
}
