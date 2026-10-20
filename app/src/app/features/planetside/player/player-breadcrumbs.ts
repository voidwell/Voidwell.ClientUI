/** One step of the trail in the character card. `path`, relative to the player, links it; the current page has none. */
export interface PlayerBreadcrumb {
    label: string;
    path?: string;
}

/** The trail to a player page: Overview, then the given steps. The last step is the current page, so it is not a link. */
export function playerTrail(...steps: PlayerBreadcrumb[]): PlayerBreadcrumb[] {
    const trail = [{ label: 'Overview', path: 'stats' }, ...steps];
    return trail.map((step, i) => (i === trail.length - 1 ? { label: step.label } : step));
}
