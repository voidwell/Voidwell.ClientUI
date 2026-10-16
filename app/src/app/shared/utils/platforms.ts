import { Ps2Platform } from '@core/api/models/ps2/common.model';

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

export interface PlatformGroup<T> {
    platform: PlatformInfo;
    items: T[];
}

/** Splits items by their platform, in platform order. Platforms without any items are left out. */
export function groupByPlatform<T extends { platform: Ps2Platform }>(items: readonly T[]): PlatformGroup<T>[] {
    return PLATFORMS
        .map(platform => ({ platform, items: items.filter(item => item.platform === platform.id) }))
        .filter(group => group.items.length > 0);
}
