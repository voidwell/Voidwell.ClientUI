export interface NavNode {
    name: string;
    url: string;
    icon?: string;
    exact: boolean;
    children: NavNode[];
}

export const NAV_DATA: NavNode[] = [
    {
        name: 'Home',
        url: '/',
        icon: 'mdi-home',
        exact: true,
        children: []
    },
    {
        name: 'Blog',
        url: '/blog',
        icon: 'mdi-message-text',
        exact: false,
        children: []
    },
    {
        name: 'Planetside 2',
        url: '/ps2',
        icon: 'mdi-gamepad-variant',
        exact: false,
        children: [
            {
                name: 'News',
                url: '/ps2/news',
                exact: false,
                children: []
            },
            {
                name: 'Alerts',
                url: '/ps2/alerts',
                exact: false,
                children: []
            },
            {
                name: 'Events',
                url: '/ps2/events',
                exact: false,
                children: []
            },
            {
                name: 'Map',
                url: '/ps2/map',
                exact: false,
                children: []
            },
            {
                name: 'Server Status',
                url: '/ps2/worlds',
                exact: false,
                children: []
            },
            {
                name: 'Weapon Tracker',
                url: '/ps2/oracle',
                exact: false,
                children: []
            },
            {
                name: 'Player Ranks',
                url: '/ps2/ranks',
                exact: false,
                children: []
            },
            {
                name: 'Population',
                url: '/ps2/population',
                exact: false,
                children: []
            },
            {
                name: 'Bulk Stats',
                url: '/ps2/bulk',
                exact: false,
                children: []
            }
        ]
    }
];