/** An area of the admin site, for its tab and its tile on the dashboard. */
export interface AdminSection {
    path: string;
    display: string;
    description: string;
    /** Roles that may use the area. */
    roles: string[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
    { path: 'events', display: 'Events', description: 'Create and edit custom events, and open their stats.', roles: ['Administrator', 'Events'] },
    { path: 'psb', display: 'PSB', description: 'See when accounts last played.', roles: ['Administrator', 'PSB'] },
    { path: 'blog', display: 'Blog', description: 'Write and edit posts.', roles: ['Administrator', 'Blog'] },
    { path: 'status', display: 'Status', description: 'Switch services on and off, and refresh stores.', roles: ['Administrator'] }
];

/** The areas a user with the given roles may use, in order. */
export function permittedSections(userRoles: readonly string[] | null | undefined): AdminSection[] {
    return ADMIN_SECTIONS.filter(section => section.roles.some(role => userRoles?.includes(role)));
}
