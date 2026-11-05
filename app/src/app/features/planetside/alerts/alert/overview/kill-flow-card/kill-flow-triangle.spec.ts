import { KillFlowPair } from './kill-flow';
import { buildKillTriangle, TRIANGLE_NODE_RADIUS } from './kill-flow-triangle';

const pair = (a: number, b: number, aKills: number, bKills: number): KillFlowPair => ({
    a, b, aKills, bKills,
    aShare: aKills / (aKills + bKills),
    leader: aKills === bKills ? null : aKills > bKills ? a : b,
    margin: Math.abs(aKills - bKills)
});

describe('buildKillTriangle', () => {
    const pairs = [pair(1, 2, 300, 200), pair(1, 3, 100, 150), pair(2, 3, 50, 75)];

    it('needs all three empires fighting each other', () => {
        expect(buildKillTriangle(pairs.slice(0, 2))).toBeNull();
        expect(buildKillTriangle([])).toBeNull();
    });

    it('puts an empire at each corner and an edge between each pair', () => {
        const triangle = buildKillTriangle(pairs);

        expect(triangle.nodes.map(n => n.factionId)).toEqual([1, 2, 3]);
        expect(triangle.edges.map(e => [e.pair.a, e.pair.b])).toEqual([[1, 2], [1, 3], [2, 3]]);
    });

    it('splits each edge in proportion to the kills each way', () => {
        const [edge] = buildKillTriangle(pairs).edges;
        const length = (s: { x1: number; y1: number; x2: number; y2: number }) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1);

        expect(edge.aSegment.x2).toBeCloseTo(edge.bSegment.x1);
        expect(edge.aSegment.y2).toBeCloseTo(edge.bSegment.y1);
        expect(length(edge.aSegment) / (length(edge.aSegment) + length(edge.bSegment))).toBeCloseTo(.6);
    });

    it('stops each edge short of the nodes', () => {
        const [edge] = buildKillTriangle(pairs).edges;
        const [vs] = buildKillTriangle(pairs).nodes;

        expect(Math.hypot(edge.aSegment.x1 - vs.x, edge.aSegment.y1 - vs.y)).toBeCloseTo(TRIANGLE_NODE_RADIUS);
    });

    it('puts the figures outside the triangle, and the margin outside a slanted edge but inside the flat one', () => {
        const triangle = buildKillTriangle(pairs);
        const [vs, nc, tr] = triangle.nodes;
        const centre = { x: (vs.x + nc.x + tr.x) / 3, y: (vs.y + nc.y + tr.y) / 3 };
        const dist = (p: { x: number; y: number }) => Math.hypot(p.x - centre.x, p.y - centre.y);

        for (const edge of triangle.edges) {
            const middle = { x: (edge.aSegment.x1 + edge.bSegment.x2) / 2, y: (edge.aSegment.y1 + edge.bSegment.y2) / 2 };
            const flat = edge.aSegment.y1 === edge.bSegment.y2;
            expect(dist(edge.aLabel)).toBeGreaterThan(dist(middle));
            expect(dist(edge.marginLabel) > dist(middle)).toBe(!flat);
        }
    });

    it('hangs the margin away from each slanted edge and centres it under the flat one', () => {
        const edges = buildKillTriangle(pairs).edges;

        expect(edges.map(e => e.marginAnchor)).toEqual(['end', 'start', 'middle']);
    });
});
