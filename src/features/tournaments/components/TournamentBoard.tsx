import type { Sport, Tournament } from '@/shared/api/types';
import { clubsByName } from '../model';
import type { TournamentActions } from '../queries';
import { AmericanoBoard } from './AmericanoBoard';
import { BracketGroupBoard } from './BracketGroupBoard';
import { LadderBoard } from './LadderBoard';
import { TeamMatchBoard } from './TeamMatchBoard';

export interface TournamentBoardProps {
  tournament: Tournament;
  sport: Sport;
  editable: boolean;
  actions?: TournamentActions;
}

/**
 * Единственное место, где приложение выбирает движок. Та же доска рисуется и
 * организатору, и гостю на публичной странице — разница только в `editable`.
 */
export function TournamentBoard({ tournament, sport, editable, actions }: TournamentBoardProps) {
  switch (tournament.engine) {
    case 'bracket-group':
      return (
        <BracketGroupBoard
          tournament={tournament}
          sport={sport}
          clubs={clubsByName(tournament)}
          editable={editable}
          actions={actions}
        />
      );

    case 'americano':
      return <AmericanoBoard tournament={tournament} editable={editable} actions={actions} />;

    case 'turnik-ladder':
      return <LadderBoard tournament={tournament} editable={editable} actions={actions} />;

    case 'team-match-log':
      return <TeamMatchBoard tournament={tournament} editable={editable} actions={actions} />;
  }
}
