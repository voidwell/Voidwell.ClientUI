import { Component, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { NavMenuService } from './../shared/services/nav-menu.service';
import { BehaviorSubject } from 'rxjs';

export class NavNode {
    name: string;
    url: string;
    icon: string;
    exact: boolean;
    children: NavNode[];
}

const NAV_DATA: NavNode[] = [
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
                icon: null,
                exact: false,
                children: []
            },
            {
                name: 'Alerts',
                url: '/ps2/alerts',
                icon: null,
                exact: false,
                children: []
            },
            {
                name: 'Events',
                url: '/ps2/events',
                icon: null,
                exact: false,
                children: []
            },
            {
                name: 'Server Status',
                url: '/ps2/worlds',
                icon: null,
                exact: false,
                children: []
            },
            {
                name: 'Weapon Tracker',
                url: '/ps2/oracle',
                icon: null,
                exact: false,
                children: []
            },
            {
                name: 'Player Ranks',
                url: '/ps2/ranks',
                icon: null,
                exact: false,
                children: []
            },
            {
                name: 'Population',
                url: '/ps2/population',
                icon: null,
                exact: false,
                children: []
            }
        ]
    },
    {
        name: 'Planetside Arena',
        url: '/psa',
        icon: 'mdi-gamepad-variant',
        exact: false,
        children: []
    }
];

@Component({
    selector: 'vw-navigation',
    templateUrl: './vw-navigation.template.html',
    styleUrls: ['./vw-navigation.styles.css']
})
export class VWNavigationComponent implements OnDestroy {
    public sidenavState: boolean;
    public mobileQuery: MediaQueryList;

    nestedTreeControl: NestedTreeControl<NavNode>;
    public nestedDataSource: MatTreeNestedDataSource<NavNode>;

    private mobileQueryListener: any; //MediaQueryListListener

    constructor(public navMenuService: NavMenuService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public zone: NgZone) {
        let database = new NavDatabase();

        this.navMenuService.onToggle.subscribe(state => this.sidenavState = state);

        this.nestedTreeControl = new NestedTreeControl<NavNode>(this._getChildren);
        this.nestedDataSource = new MatTreeNestedDataSource();

        database.dataChange.subscribe(data => this.nestedDataSource.data = data);

        this.mobileQuery = media.matchMedia('(max-width: 1279px)');
        this.mobileQueryListener = (mql) => {
            if (mql.matches) {
                this.zone.run(() => {
                    this.navMenuService.close();
                });
            } else {
                this.zone.run(() => {
                    this.navMenuService.open();
                });
            }
        };
        this.mobileQuery.addListener(this.mobileQueryListener);

        if (this.mobileQuery.matches) {
            this.navMenuService.close();
        } else {
            this.navMenuService.open();
        }
    }

    public closed() {
        this.navMenuService.close();
    }

    public setActiveNode(node: NavNode) {
        this.nestedTreeControl.expandDescendants(node);
    }

    public hasNestedChild = (_: number, nodeData: NavNode) => nodeData.children.length > 0;

    private _getChildren = (node: NavNode) => node.children;

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this.mobileQueryListener);
    }
}

export class NavDatabase {
    dataChange = new BehaviorSubject<NavNode[]>([]);

    get data(): NavNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        const data = NAV_DATA.slice();
        this.dataChange.next(data);
    }
}