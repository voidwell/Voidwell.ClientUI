declare module 'dynamics.js' {
    /** Sets CSS properties (including transforms such as `translateX`) on an element. */
    export function css(element: Element, properties: Record<string, string | number>): void;

    const dynamics: { css: typeof css };
    export default dynamics;
}
