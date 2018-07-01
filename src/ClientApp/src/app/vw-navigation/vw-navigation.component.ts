import { Component, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { NavMenuService } from './../shared/services/nav-menu.service';

@Component({
    selector: 'vw-navigation',
    templateUrl: './vw-navigation.template.html',
    styleUrls: ['./vw-navigation.styles.css']
})

export class VWNavigationComponent implements OnDestroy {
    public sidenavState: boolean;

    private mobileQuery: MediaQueryList;
    private mobileQueryListener: (mql: MediaQueryList) => void;

    constructor(public navMenuService: NavMenuService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, public zone: NgZone) {
        this.navMenuService.onToggle.subscribe(state => this.sidenavState = state);

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

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this.mobileQueryListener);
    }
}