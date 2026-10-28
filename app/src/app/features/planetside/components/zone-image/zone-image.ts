/** The continent artwork served from the site root, by zone id. Zones without artwork are left out. */
const ZONE_IMAGES: Record<number, string> = {
    2: '/Indar-160.jpg',
    4: '/Hossin-160.jpg',
    6: '/Amerish-160.jpg',
    8: '/Esamir-160.jpg',
    344: '/Oshur-160.jpg'
};

/** The artwork of a continent, or `null` when the zone is unknown or has none. */
export function zoneImageUrl(zoneId: number | string | null | undefined): string | null {
    const id = Number(zoneId);
    return Number.isFinite(id) ? ZONE_IMAGES[id] ?? null : null;
}
