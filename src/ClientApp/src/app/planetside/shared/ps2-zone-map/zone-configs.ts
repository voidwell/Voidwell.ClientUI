export const FactionColors = {
    0: {
        default: '#79e0e1',
        dark: '#249c9e'
    },
    1: {
        default: '#9e52e0',
        dark: '#4f2970'
    },
    2: {
        default: '#33adff',
        dark: '#1a5780'
    },
    3: {
        default: '#df2020',
        dark: '#701010'
    }
};

export const RegionStyles = {
    0: {
        default: {
            weight: 1.2,
            color: '#000',
            opacity: 1,
            fillOpacity: 0,
            pane: 'regions'
        }
    },
    1: {
        default: {
            weight: 1.2,
            fillColor: FactionColors[1].default,
            fillOpacity: 0.4,
            color: '#000'
        },
        dark: {
            weight: 1.2,
            fillColor: FactionColors[1].dark,
            fillOpacity: 0.7,
            color: '#000'
        }
    },
    2: {
        default: {
            weight: 1.2,
            fillColor: FactionColors[2].default,
            fillOpacity: 0.4,
            color: '#000'
        },
        dark: {
            weight: 1.2,
            fillColor: FactionColors[2].dark,
            fillOpacity: 0.7,
            color: '#000'
        }
    },
    3: {
        default: {
            weight: 1.2,
            fillColor: FactionColors[3].default,
            fillOpacity: 0.4,
            color: '#000'
        },
        dark: {
            weight: 1.2,
            fillColor: FactionColors[3].dark,
            fillOpacity: 0.7,
            color: '#000'
        }
    }
};

export const LatticeStyles = {
    ns: {
        line: {
            color: FactionColors[0].default,
            pane: 'latticePane',
            weight: 2,
            clickable: false,
            dashArray: null,
            interactive: false
        },
        outline: {
            color: '#FFF',
            pane: 'latticePane',
            weight: 4,
            clickable: false,
            interactive: false
        }
    },
    nc: {
        line: {
            color: FactionColors[2].default,
            pane: 'latticePane',
            weight: 2,
            clickable: false,
            dashArray: null,
            interactive: false
        },
        outline: {
            color: '#FFF',
            pane: 'latticePane',
            weight: 4,
            clickable: false,
            interactive: false
        }
    },
    tr: {
        line: {
            color: FactionColors[3].default,
            pane: 'latticePane',
            weight: 2,
            clickable: false,
            dashArray: null,
            interactive: false
        },
        outline: {
            color: '#FFF',
            pane: 'latticePane',
            weight: 4,
            clickable: false,
            interactive: false
        }
    },
    vs: {
        line: {
            color: FactionColors[1].default,
            pane: 'latticePane',
            weight: 2,
            clickable: false,
            dashArray: null,
            interactive: false
        },
        outline: {
            color: '#FFF',
            pane: 'latticePane',
            weight: 4,
            clickable: false,
            interactive: false
        }
    },
    contested: {
        line: {
            color: '#FFFF00',
            pane: 'latticePane',
            weight: 3,
            clickable: false,
            dashArray: [6],
            interactive: false
        },
        outline: {
            color: '#000',
            pane: 'latticePane',
            weight: 5,
            clickable: false,
            interactive: false
        }
    }
};