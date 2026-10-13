import { AccountCard } from './AccountCard';
import { PasswordCard } from './PasswordCard';
import { PlayerCard } from './PlayerCard';

export function ProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <AccountCard />
      <PlayerCard />
      <PasswordCard />
    </div>
  );
}
