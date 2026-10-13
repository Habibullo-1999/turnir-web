import { useCallback, useEffect, useState } from 'react';
import type { Organization } from '@/shared/api/types';
import { useOrganizations } from './queries';

const STORAGE_KEY = 'turnir.activeOrg';

/**
 * Выбор организации — удобство конкретного браузера, а не состояние аккаунта,
 * поэтому localStorage. Он может быть недоступен (приватное окно, запрет на
 * site data), и это не должно ломать приложение.
 */
function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Читать будет нечего — просто каждый раз возьмём первую организацию.
  }
}

export interface ActiveOrg {
  organizations: Organization[];
  active: Organization | undefined;
  /** id для запросов; undefined, пока список грузится или организаций нет. */
  orgId: string | undefined;
  setActive: (id: string) => void;
  isPending: boolean;
  /** Ни одной организации — человеку нужно её создать или принять приглашение. */
  isEmpty: boolean;
}

export function useActiveOrg(): ActiveOrg {
  const { data: organizations = [], isPending } = useOrganizations();
  const [selected, setSelected] = useState<string | null>(readStored);

  // Сохранённой организации может уже не быть: из неё вышли или её удалили.
  const active = organizations.find((org) => org.id === selected) ?? organizations[0];

  useEffect(() => {
    if (active && active.id !== selected) {
      setSelected(active.id);
      writeStored(active.id);
    }
  }, [active, selected]);

  const setActive = useCallback((id: string) => {
    setSelected(id);
    writeStored(id);
  }, []);

  return {
    organizations,
    active,
    orgId: active?.id,
    setActive,
    isPending,
    isEmpty: !isPending && organizations.length === 0,
  };
}
