import type { PlayerStats, Sport } from '@/shared/api/types';
import { Card, CardTitle } from '@/shared/ui/Card';
import { Select } from '@/shared/ui/Field';
import { cn } from '@/shared/lib/cn';

export interface CareerCardProps {
  stats: PlayerStats;
  sports: Sport[];
  /** Пустая строка — все виды спорта сразу. */
  sport: string;
  onSportChange: (sport: string) => void;
}

/**
 * Итоги игрока. Главное здесь — разрез по виду спорта: без него числа
 * складываются через запятую голы, сеты и очки, и «716» не значит ничего.
 */
export function CareerCard({ stats, sports, sport, onSportChange }: CareerCardProps) {
  const selected = sports.find((item) => item.code === sport);
  const decided = stats.wins + stats.draws + stats.losses;
  const winRate = decided > 0 ? Math.round((stats.wins / decided) * 100) : null;

  // Турник — лестница на выбывание, матчей в нём нет вовсе. Ряд нулей выглядел
  // бы как «не играл», хотя человек проходил раунды.
  const isLadder = selected?.engine === 'turnik-ladder';

  return (
    <Card>
      <CardTitle
        action={
          <Select
            aria-label="Вид спорта"
            className="w-auto py-1 text-xs"
            value={sport}
            onChange={(event) => onSportChange(event.target.value)}
          >
            <option value="">Все виды спорта</option>
            {sports.map((item) => (
              <option key={item.code} value={item.code}>
                {item.icon} {item.label}
              </option>
            ))}
          </Select>
        }
      >
        Карьера
      </CardTitle>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile value={stats.trophies} label="Побед в турнирах" tone="gold" />
        <Tile value={stats.tournaments} label="Турниров сыграно" />
        {isLadder ? (
          <Tile value="—" label="Матчей нет" hint="в турнике их не бывает" />
        ) : (
          <>
            <Tile value={stats.played} label="Матчей" />
            <Tile
              value={winRate === null ? '—' : `${winRate}%`}
              label="Побед в матчах"
              tone="brand"
            />
          </>
        )}
      </div>

      {isLadder ? (
        <p className="text-ink-muted mt-4 text-sm">
          В турнике нет матчей: результат — сколько раундов удалось пройти. Эти итоги
          лежат в разделе «Статистика» на вкладке «Турник».
        </p>
      ) : (
        <>
          <ResultsBar stats={stats} hasDraws={selected?.hasDraws ?? true} />
          <MetricLine stats={stats} sport={selected} />
        </>
      )}
    </Card>
  );
}

/** Полоса побед, ничьих и поражений: соотношение читается быстрее трёх чисел. */
function ResultsBar({ stats, hasDraws }: { stats: PlayerStats; hasDraws: boolean }) {
  const total = stats.wins + stats.draws + stats.losses;
  if (total === 0) return null;

  const segments = [
    { key: 'wins', value: stats.wins, className: 'bg-brand', label: 'побед' },
    ...(hasDraws
      ? [{ key: 'draws', value: stats.draws, className: 'bg-ink-muted', label: 'ничьих' }]
      : []),
    { key: 'losses', value: stats.losses, className: 'bg-danger', label: 'поражений' },
  ].filter((segment) => segment.value > 0);

  return (
    <div className="mt-5 flex flex-col gap-2">
      <div className="bg-line flex h-2.5 overflow-hidden rounded-full">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="text-ink-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {segments.map((segment) => (
          <span key={segment.key} className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', segment.className)} />
            {segment.value} {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Забитое и пропущенное. В разных видах спорта это разные единицы — голы, сеты,
 * очки, — поэтому без выбранного вида спорта строка не показывается: сумма
 * голов и сетов не значит ничего.
 */
function MetricLine({ stats, sport }: { stats: PlayerStats; sport: Sport | undefined }) {
  if (!sport) {
    return (
      <p className="border-line text-ink-muted mt-5 border-t pt-4 text-xs">
        Забитое и пропущенное здесь не показано: в футболе это голы, в теннисе 1×1 — сеты,
        в американо — очки. Складывать их нельзя. Выберите вид спорта, чтобы увидеть
        эти цифры.
      </p>
    );
  }

  if (stats.played === 0) return null;

  const diff = stats.goalsFor - stats.goalsAgainst;
  const perMatch = (stats.goalsFor / stats.played).toFixed(1);

  return (
    <div className="border-line mt-5 border-t pt-4 text-sm">
      <span className="text-ink-muted">{sport.diffLabel}: </span>
      <span className="text-ink font-medium tabular-nums">{stats.goalsFor}</span>
      <span className="text-ink-muted"> забил · </span>
      <span className="text-ink font-medium tabular-nums">{stats.goalsAgainst}</span>
      <span className="text-ink-muted"> пропустил · разница </span>
      <span
        className={cn(
          'font-medium tabular-nums',
          diff > 0 ? 'text-brand' : diff < 0 ? 'text-danger' : 'text-ink-muted',
        )}
      >
        {diff > 0 ? '+' : ''}
        {diff}
      </span>
      <span className="text-ink-muted"> · в среднем {perMatch} за матч</span>
    </div>
  );
}

function Tile({
  value,
  label,
  hint,
  tone = 'neutral',
}: {
  value: number | string;
  label: string;
  hint?: string;
  tone?: 'neutral' | 'brand' | 'gold';
}) {
  const color = tone === 'brand' ? 'text-brand' : tone === 'gold' ? 'text-gold' : 'text-ink';

  return (
    <div className="border-line bg-surface rounded-xl border px-3 py-2.5">
      <div className={cn('text-2xl font-bold tabular-nums', color)}>{value}</div>
      <div className="text-ink-muted text-xs">{label}</div>
      {hint && <div className="text-ink-dim text-[0.65rem]">{hint}</div>}
    </div>
  );
}
