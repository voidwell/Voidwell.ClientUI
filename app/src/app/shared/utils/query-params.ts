/** The query parameters that have a value, as a plain object ready to be written back to the URL. */
export function definedParams(values: Record<string, string | null | undefined>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== null && value !== '') {
            result[key] = value;
        }
    }
    return result;
}
