import { PS2_PLATFORMS, Ps2Platform } from '@core/api/models/ps2/common.model';

/** How a PlanetSide 2 platform is shown to the user. */
export interface PlatformInfo {
    id: Ps2Platform;
    name: string;
    /** A Material Design Icons class, e.g. `mdi-microsoft-windows`. */
    icon: string;
}

/** Every platform, in the order they are listed. */
export const PLATFORMS: readonly PlatformInfo[] = [
    { id: 'pc', name: 'PC', icon: 'mdi-microsoft-windows' },
    { id: 'ps4us', name: 'PS4-US', icon: 'mdi-sony-playstation' },
    { id: 'ps4eu', name: 'PS4-EU', icon: 'mdi-sony-playstation' }
];

/** The query parameter that names the platform of a PlanetSide page, e.g. `/ps2/alerts?platform=ps4us`. */
export const PLATFORM_QUERY_PARAM = 'platform';

const STORAGE_KEY = 'voidwell-ps2-platform';

export function isPs2Platform(value: unknown): value is Ps2Platform {
    return PS2_PLATFORMS.includes(value as Ps2Platform);
}

/** The platform the user last picked, `pc` if none was saved or storage is unavailable. */
export function loadSavedPlatform(): Ps2Platform {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return isPs2Platform(saved) ? saved : 'pc';
    } catch {
        return 'pc';
    }
}

export function savePlatform(platform: Ps2Platform): void {
    try {
        localStorage.setItem(STORAGE_KEY, platform);
    } catch {
        // Storage can be blocked (private mode, cookie settings); the choice then lasts for this visit only.
    }
}
