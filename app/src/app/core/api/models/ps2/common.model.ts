/** ISO 8601 timestamp as serialized by the API. */
export type IsoDateString = string;

/** A value per faction (VS / NC / TR / NS). */
export interface FactionValues {
    vs: number;
    nc: number;
    tr: number;
    ns: number;
}

export interface PopulationPeriod {
    timestamp?: IsoDateString;
    vs: number;
    nc: number;
    tr: number;
    ns: number;
}

/**
 * A Daybreak API instance. The `platform` query parameter selects which of the
 * three deployed instances serves a request.
 */
export type Ps2Platform = 'pc' | 'ps4us' | 'ps4eu';

export const PS2_PLATFORMS: readonly Ps2Platform[] = ['pc', 'ps4us', 'ps4eu'];
