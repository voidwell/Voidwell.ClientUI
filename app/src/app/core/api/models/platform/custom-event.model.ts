import { CombatReport } from '../ps2/combat-report.model';

export interface CustomEventTeam {
    customEventId?: number;
    teamId: string;
    name: string;
}

/** An event as listed by `GET platform/gameevent` and used as the create / update body. */
export interface CustomEvent {
    id: number;
    name: string;
    serverId?: string;
    mapId?: string;
    description?: string;
    startDate: string;
    endDate: string;
    isPrivate: boolean;
    gameId?: string;
    scoreConfiguration?: string;
    teams?: CustomEventTeam[];
}

/** `GET platform/gameevent/{id}` */
export interface CustomEventDetails extends CustomEvent {
    log?: CombatReport;
    /** Territory control per faction at the end of the event. */
    score?: number[];
}
