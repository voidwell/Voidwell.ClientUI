import { KillFlowPair } from './kill-flow';

export interface TrianglePoint {
    x: number;
    y: number;
}

export interface TriangleNode extends TrianglePoint {
    factionId: number;
}

export interface TriangleSegment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface TriangleEdge {
    pair: KillFlowPair;
    /** The stretch from `a`'s node to the split point, and from there to `b`'s node. */
    aSegment: TriangleSegment;
    bSegment: TriangleSegment;
    /** Where each side's figure sits, just outside the edge. */
    aLabel: TrianglePoint;
    bLabel: TrianglePoint;
    /** Where the leader's margin sits: outside a slanted edge, where the other edges can't crowd it, and above a flat one. */
    marginLabel: TrianglePoint;
    /** How the margin's text hangs from `marginLabel`: away from a slanted edge so it never covers it. */
    marginAnchor: 'start' | 'middle' | 'end';
}

export interface KillTriangle {
    nodes: TriangleNode[];
    edges: TriangleEdge[];
}

export const TRIANGLE_VIEWBOX = { width: 340, height: 310 };
export const TRIANGLE_NODE_RADIUS = 22;

/** VS on top, NC bottom left, TR bottom right. */
const NODES: TriangleNode[] = [
    { factionId: 1, x: 170, y: 50 },
    { factionId: 2, x: 50, y: 255 },
    { factionId: 3, x: 290, y: 255 }
];

const LABEL_OFFSET = 18;
const MARGIN_OFFSET = 16;

/**
 * Lays the head-to-head pairs out as the edges of a triangle with an empire at each corner, each edge split in
 * proportion to the kills each way. Null unless all three empires fight each other, since a missing corner leaves
 * nothing to draw.
 */
export function buildKillTriangle(pairs: readonly KillFlowPair[]): KillTriangle | null {
    if (pairs.length !== 3) {
        return null;
    }
    const centre = {
        x: NODES.reduce((sum, n) => sum + n.x, 0) / NODES.length,
        y: NODES.reduce((sum, n) => sum + n.y, 0) / NODES.length
    };

    const edges: TriangleEdge[] = [];
    for (const pair of pairs) {
        const from = NODES.find(n => n.factionId === pair.a);
        const to = NODES.find(n => n.factionId === pair.b);
        if (!from || !to) {
            return null;
        }
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        const ux = (to.x - from.x) / length;
        const uy = (to.y - from.y) / length;
        const start = { x: from.x + ux * TRIANGLE_NODE_RADIUS, y: from.y + uy * TRIANGLE_NODE_RADIUS };
        const end = { x: to.x - ux * TRIANGLE_NODE_RADIUS, y: to.y - uy * TRIANGLE_NODE_RADIUS };
        const along = (t: number): TrianglePoint => ({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t });
        const split = along(pair.aShare);

        // The normal pointing away from the centre puts figures outside the edge and the margin inside it.
        let nx = -uy;
        let ny = ux;
        if (((from.x + to.x) / 2 - centre.x) * nx + ((from.y + to.y) / 2 - centre.y) * ny < 0) {
            nx = -nx;
            ny = -ny;
        }
        const slanted = Math.abs(nx) > .3;
        const shifted = (point: TrianglePoint, by: number): TrianglePoint => ({ x: point.x + nx * by, y: point.y + ny * by });

        edges.push({
            pair,
            aSegment: { x1: start.x, y1: start.y, x2: split.x, y2: split.y },
            bSegment: { x1: split.x, y1: split.y, x2: end.x, y2: end.y },
            aLabel: shifted(along(.2), LABEL_OFFSET),
            bLabel: shifted(along(.8), LABEL_OFFSET),
            marginLabel: shifted(along(.5), slanted ? LABEL_OFFSET : -MARGIN_OFFSET),
            marginAnchor: !slanted ? 'middle' : nx > 0 ? 'start' : 'end'
        });
    }
    return { nodes: NODES, edges };
}
