import { Component, input } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';

/** The Voidwell logo outline; same path as the one in vw-logo. */
const LOGO_PATH = 'M0,0H304L515,292,726,0h305L727,422,638,299l46-65,43,58L883,75H766L515,422,264,75H148L304,292l43-58,46,65L304,422ZM515,0l84,115-46,65-38-51-37,51-46-65Z';
const LOGO_WIDTH = 1031;
const LOGO_HEIGHT = 422;

/** Where the glass was hit, as fractions of the logo's width and height. */
const IMPACT: [number, number] = [0.5, 0.42];
/** Distances of the crack rings from the impact; the last one is beyond every corner of the logo. */
const RING_RADII = [0, 70, 190, 360, 1100];
const SPOKE_COUNT = 14;
/** How far each vertex may wander from its regular position, as a fraction of the gap to its neighbour. */
const JITTER = 0.35;

const MAX_PUSH = 7;
const MAX_TILT_DEG = 4;
const SHRINK = 0.97;
const MIN_OPACITY = 0.6;
const PADDING = 12;

type Point = [number, number];

interface Shard {
    points: string;
    transform: string;
    opacity: number;
}

/** Deterministic pseudo-random number in [0, 1), so the glass breaks the same way on every render. */
const random = (seed: number): number => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
};

const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * Breaks the logo like glass hit at one point: cracks run out from the impact along jittered spokes
 * and cross jittered rings, which splits it into shards. Each shard is a clip of the whole logo,
 * pushed slightly away from the impact, tilted and shrunk so the cracks show between the pieces.
 */
const buildShards = (): Shard[] => {
    const cx = IMPACT[0] * LOGO_WIDTH;
    const cy = IMPACT[1] * LOGO_HEIGHT;
    const step = (Math.PI * 2) / SPOKE_COUNT;

    // vertices[ring][spoke]; the spokes wrap around, and every ring shares its vertices with the next shard.
    const vertices: Point[][] = RING_RADII.map((radius, ring) =>
        Array.from({ length: SPOKE_COUNT }, (_, spoke) => {
            const angle = (spoke + (random(spoke + 1) - 0.5) * 2 * JITTER) * step;
            const gap = RING_RADII[Math.min(ring + 1, RING_RADII.length - 1)] - RING_RADII[Math.max(ring - 1, 0)];
            const distance = radius === 0 ? 0 : radius + (random(ring * 100 + spoke + 7) - 0.5) * gap * JITTER;
            return [cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance] as Point;
        })
    );

    const shards: Shard[] = [];

    for (let ring = 0; ring < RING_RADII.length - 1; ring++) {
        for (let spoke = 0; spoke < SPOKE_COUNT; spoke++) {
            const next = (spoke + 1) % SPOKE_COUNT;
            const polygon = [vertices[ring][spoke], vertices[ring][next], vertices[ring + 1][next], vertices[ring + 1][spoke]];

            const centroidX = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
            const centroidY = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
            const seed = ring * SPOKE_COUNT + spoke;

            const away = Math.atan2(centroidY - cy, centroidX - cx);
            const push = random(seed + 301) * MAX_PUSH;
            const tilt = (random(seed + 401) - 0.5) * 2 * MAX_TILT_DEG;

            shards.push({
                points: polygon.map(p => `${round(p[0])},${round(p[1])}`).join(' '),
                transform: `translate(${round(Math.cos(away) * push)} ${round(Math.sin(away) * push)}) `
                    + `rotate(${round(tilt)} ${round(centroidX)} ${round(centroidY)}) `
                    + `translate(${round(centroidX * (1 - SHRINK))} ${round(centroidY * (1 - SHRINK))}) scale(${SHRINK})`,
                opacity: round(MIN_OPACITY + (1 - MIN_OPACITY) * random(seed + 501))
            });
        }
    }

    return shards;
};

let nextId = 0;

@Component({
    selector: 'vw-error-card',
    templateUrl: './error-card.component.html',
    styleUrl: './error-card.component.css',
    imports: [MatCard, MatCardContent]
})
export class ErrorCardComponent {
    readonly message = input('Unable to load data. Please try again later.');

    /** Ids are document-wide, so each card needs its own for the shared path and the shard clips. */
    private readonly id = nextId++;
    readonly pathId = `error-card-logo-${this.id}`;
    readonly clipId = (index: number): string => `error-card-shard-${this.id}-${index}`;
    readonly clipUrl = (index: number): string => `url(#${this.clipId(index)})`;

    readonly logoPath = LOGO_PATH;
    readonly shards = buildShards();
    readonly viewBox = `${-PADDING} ${-PADDING} ${LOGO_WIDTH + PADDING * 2} ${LOGO_HEIGHT + PADDING * 2}`;
}
