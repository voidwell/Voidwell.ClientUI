import { IsoDateString } from './common.model';

/** `GET ps2/profile` (classes) */
export interface Profile {
    id: number;
    profileTypeId: number;
    factionId: number;
    name?: string;
    imageId: number;
}

/** `GET ps2/vehicle` */
export interface VehicleInfo {
    id: number;
    name?: string;
    description?: string;
    imageId?: number;
    factions?: number[];
}

/** `GET ps2/zone` */
export interface Zone {
    id: number;
    name?: string;
    description?: string;
    code?: string;
    hexSize?: number;
}

/** `GET ps2/grades` */
export interface StatGrade {
    grade?: string;
    delta: number;
}

/** `GET ps2/ranks` */
export interface RatingCharacter {
    characterId?: string;
    name?: string;
    factionId?: number;
    worldId?: number;
    battleRank?: number;
    rating: number;
    deviation: number;
}

/** `GET ps2/search/{category}/{query}` */
export interface SearchResult {
    type?: string;
    name?: string;
    id?: string;
    battleRank: number;
    factionId?: number;
    worldId?: number;
    alias?: string;
    memberCount: number;
    categoryId?: string;
}

/** `GET ps2/feeds/news` and `GET ps2/feeds/updates` */
export interface FeedItem {
    title?: string;
    content?: string;
    date: IsoDateString;
    link?: string;
    author?: string;
}
