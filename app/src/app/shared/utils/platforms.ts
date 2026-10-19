import { Ps2Platform } from '@core/api/models/ps2/common.model';
import { PLATFORMS, PlatformInfo } from '@core/platform/platforms';

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
