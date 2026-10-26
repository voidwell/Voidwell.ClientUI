import { BlogPost } from '@core/api/models/platform/post.model';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CharacterLastSession } from '@core/api/models/ps2/admin.model';

/** A .NET TimeSpan (`d.hh:mm:ss`, the days and the fraction optional) in seconds; `null` when it is not one. */
export function parseTimeSpan(text: string | null | undefined): number | null {
    const match = /^(?:(\d+)\.)?(\d+):(\d{2}):(\d{2})(?:\.\d+)?$/.exec(text ?? '');
    if (!match) {
        return null;
    }

    const [, days, hours, minutes, seconds] = match;
    return (+(days ?? 0) * 24 + +hours) * 3600 + +minutes * 60 + +seconds;
}

/** A time span as the two largest units it has, such as "1 day 6 hours"; a dash when it is not known or is nothing. */
export function formatTimeSpan(text: string | null | undefined): string {
    const total = parseTimeSpan(text);
    if (!total) {
        return total === null && text ? text : '—';
    }

    const units: [string, number][] = [['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    const parts: string[] = [];
    let rest = total;
    for (const [name, size] of units) {
        const count = Math.floor(rest / size);
        rest -= count * size;
        if (count > 0 && parts.length < 2) {
            parts.push(`${count} ${name}${count === 1 ? '' : 's'}`);
        }
    }
    return parts.join(' ');
}

/** A blog post as the table shows it. */
export interface BlogRow {
    id: string;
    title: string;
    author: string;
    /** ISO date of publishing. */
    published: string;
    post: BlogPost;
}

export const blogRows = (posts: readonly BlogPost[]): BlogRow[] => posts.map(post => ({
    id: post.id, title: post.title ?? '', author: post.authorName ?? '', published: post.publishDate, post
}));

/** A custom event as the table shows it. */
export interface EventRow {
    id: number;
    name: string;
    start: string;
    end: string;
    server: string;
    map: string;
    event: CustomEvent;
}

/** The events with their server and map named, where the names are known. */
export function eventRows(events: readonly CustomEvent[], worldNames: Record<string, string | undefined>, zoneNames: Record<string, string | undefined>): EventRow[] {
    return events.map(event => ({
        id: event.id,
        name: event.name ?? '',
        start: event.startDate,
        end: event.endDate,
        server: (event.serverId ? worldNames[event.serverId] ?? event.serverId : '') || '',
        map: (event.mapId ? zoneNames[event.mapId] ?? event.mapId : '') || '',
        event
    }));
}

/** An account's last session as the table shows it. */
export interface SessionRow {
    characterId: string;
    name: string;
    sessionId: number | null;
    login: string;
    logout: string;
    /** Minutes. */
    minutes: number | null;
}

export const sessionRows = (sessions: readonly CharacterLastSession[]): SessionRow[] => sessions.map(session => ({
    characterId: session.characterId ?? '',
    name: session.name ?? '',
    sessionId: session.sessionId ?? null,
    login: session.loginDate ?? '',
    logout: session.logoutDate ?? '',
    minutes: typeof session.duration === 'number' && isFinite(session.duration) ? session.duration / 60000 : null
}));

/** The sessions whose player name contains the search, or whose character id is it. */
export function filterSessions(rows: readonly SessionRow[], search: string): SessionRow[] {
    const term = search.trim().toLowerCase();
    return term ? rows.filter(row => row.name.toLowerCase().includes(term) || row.characterId === search.trim()) : [...rows];
}
