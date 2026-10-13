import {DRAW_LABEL, type Tournament} from '@/shared/api/types';
import {Button} from '@/shared/ui/Button';
import {LinkButton} from '@/shared/ui/LinkButton';
import {Card} from '@/shared/ui/Card';
import {goals as pluralGoals} from '@/shared/lib/plural';
import {downloadJson, safeFilename} from '@/shared/lib/download';
import {formatDate} from '@/shared/lib/date';
import {mediaUrl} from '@/shared/lib/media';
import {matchOutcome, teamsBySide} from '../model';
import {Confetti} from './Confetti';


interface BannerCopy {
    label: string;
    icon: string;
    subText: string;
}

/**
 * В «реальном футболе» победитель — команда одного матча (или ничья), а не
 * чемпион турнира, поэтому подписи разные.
 */
function bannerCopy(tournament: Tournament): BannerCopy {
    const winner = tournament.winner ?? '';

    if (tournament.engine !== 'team-match-log') {
        return {
            label: 'Победитель турнира',
            icon: '🏆',
            subText: `🏆 Чемпион турнира «${tournament.name}»`,
        };
    }

    const {isDraw, topScorer} = matchOutcome(tournament);
    const [home, away] = teamsBySide(tournament);
    const scorerLine = topScorer
        ? ` · 👟 ${topScorer.name} — ${pluralGoals(topScorer.goals)}`
        : ' · голов никто не забил';

    return {
        label: isDraw || winner === DRAW_LABEL ? 'Итог матча' : 'Победитель матча',
        icon: isDraw || winner === DRAW_LABEL ? '🤝' : '🏆',
        subText: `${home?.score ?? 0} : ${away?.score ?? 0}${scorerLine}`,
    };
}

export function WinnerBanner({
                                 tournament,
                                 celebrate,
                                 onReopen,
                                 reopenPending,
                             }: {
    tournament: Tournament;
    celebrate?: boolean;
    onReopen?: () => void;
    reopenPending?: boolean;
}) {
    const winner = tournament.winner;
    if (!winner) return null;

    const copy = bannerCopy(tournament);
    const isMatch = tournament.engine === 'team-match-log';

    // У победителя-человека показываем его аватарку. В «реальном футболе»
    // побеждает команда, и совпадения по имени там не будет — это нормально.
    const avatarUrl = mediaUrl(
        tournament.participants?.find((participant) => participant.name === winner)?.avatarUrl,
    );

    return (
        <>
            {celebrate && <Confetti key={winner}/>}

            <Card className="flex flex-col items-center gap-2 text-center">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt=""
                        className="border-gold/40 mb-2 size-24 rounded-full border-2 object-cover"
                    />
                ) : (
                    <span className="text-5xl">{copy.icon}</span>
                )}

                <div className="text-ink-muted text-xs font-semibold tracking-[0.15em] uppercase">
                    {copy.label}
                </div>
                <div className="text-brand text-3xl font-extrabold">{winner}</div>
                <div className="text-ink-muted text-sm">{copy.subText}</div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" onClick={() => exportTournament(tournament)}>
                        📤 Экспорт результатов
                    </Button>

                    {onReopen && (
                        <>
                            <Button variant="secondary" disabled={reopenPending} onClick={onReopen}>
                                {reopenPending
                                    ? 'Возвращаем…'
                                    : isMatch
                                        ? '↩️ Вернуть матч (исправить)'
                                        : '↩️ Вернуть турнир (исправить)'}
                            </Button>
                            <LinkButton variant="secondary" to="/create">
                                {isMatch ? '🔁 Новый матч' : '🔁 Новый турнир'}
                            </LinkButton>
                        </>
                    )}
                </div>
            </Card>
        </>
    );
}

/** Выгружает турнир как есть — это ровно тот JSON, что отдаёт API. */
function exportTournament(tournament: Tournament) {
    const name = safeFilename(
        tournament.name || 'tournament',
        formatDate(tournament.finishedAt ?? tournament.createdAt).replace(/\./g, '-'),
    );
    downloadJson(`${name}.json`, tournament);
}
