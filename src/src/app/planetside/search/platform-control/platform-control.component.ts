import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { WithSubStore, select, dispatch } from '@angular-redux/store';
import { Observable, Subscription } from 'rxjs';
import { CHANGE_PLATFORM } from './../../reducers';
import reducers from './../../planetside.reducers';
import { MatSelectChange } from '@angular/material/select';

@WithSubStore({
    basePathMethodName: 'getBasePath',
    localReducer: reducers
})
@Component({
    selector: 'platform-control',
    templateUrl: './platform-control.template.html',
    styleUrls: ['./platform-control.styles.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanetsidePlatformControl implements OnDestroy {
    @select(['platform', 'platform']) readonly platform$: Observable<string>;

    private platformSub: Subscription;
    public selectedValue: string;

    constructor() {
        this.platformSub = this.platform$.subscribe(platformValue => {
            if (platformValue) {
                this.selectedValue = platformValue;
            }
        })
    }

    @dispatch() onValueChange(event: MatSelectChange) {
        return { type: CHANGE_PLATFORM, value: event.value };
    }

    ngOnDestroy() {
        if (this.platformSub) this.platformSub.unsubscribe();
    }

    private getBasePath() {
        return ['ps2'];
    }
}