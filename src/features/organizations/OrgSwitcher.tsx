import { Link } from 'react-router-dom';
import { Select } from '@/shared/ui/Field';
import { useActiveOrg } from './activeOrg';

/**
 * Переключатель организаций в шапке. С одной организацией выбирать нечего —
 * показываем просто её название, чтобы не занимать место пустым списком.
 */
export function OrgSwitcher() {
  const { organizations, active, setActive, isPending } = useActiveOrg();

  if (isPending || !active) return null;

  if (organizations.length === 1) {
    return (
      <Link
        to={`/organizations/${active.id}`}
        className="text-ink-muted hover:text-ink hidden text-xs whitespace-nowrap sm:inline"
        title="Настройки организации"
      >
        🏢 {active.name}
      </Link>
    );
  }

  return (
    <Select
      aria-label="Организация"
      className="w-auto max-w-44 py-1 text-xs"
      value={active.id}
      onChange={(event) => setActive(event.target.value)}
    >
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          🏢 {org.name}
        </option>
      ))}
    </Select>
  );
}
