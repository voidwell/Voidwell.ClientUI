import { MediaMatcher } from '@angular/cdk/layout';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, NgZone,OnChanges,OnDestroy, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, tap } from 'rxjs';
import { NavigationMap, LinkNavItem } from '@voidwell/common/navigation';
import { NavMenuService } from '../../nav-menu.service';

@Component({
    selector: 'vw-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent implements OnChanges, OnDestroy {
    @Input() navigationMap: NavigationMap | null = null;

    public mobileQuery: MediaQueryList;

    nestedTreeControl: NestedTreeControl<LinkNavItem>;
    public nestedDataSource: MatTreeNestedDataSource<LinkNavItem>;

    sideNavOpened$ =  this.navMenuService.navOpened$;

    private _mobileQueryListener: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        this.nestedDataSource.data = this.navigationMap?.side || []
    }

    constructor(public navMenuService: NavMenuService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public zone: NgZone, public router: Router) {        
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.router.url.replace(/^\/|\/$/g, '')),
                map(routerUrl => this.navigationMap!.side.find(node => (node.exact && routerUrl === node.link) || (!node.exact && routerUrl.startsWith(node.link!)))),
                filter(parentNode => !!parentNode && parentNode.subItems?.length! > 0)
            ).subscribe(parentNode => this.nestedTreeControl.expandDescendants(parentNode!));

        this.nestedTreeControl = new NestedTreeControl<LinkNavItem>(this._getChildren);
        this.nestedDataSource = new MatTreeNestedDataSource();

        this.mobileQuery = media.matchMedia('(max-width: 1279px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener((mql: any) => {
            if (!mql.matches) {
                this.navMenuService.open();
            } else {
                this.navMenuService.close();
            }
        });
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    public closed() {
        this.navMenuService.close();
    }

    public hasNestedChild = (_: number, nodeData: LinkNavItem) => nodeData.subItems?.length! > 0;

    private _getChildren = (node: LinkNavItem) => node.subItems;

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }
}