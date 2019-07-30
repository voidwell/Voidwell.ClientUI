import { Component, OnInit, OnDestroy } from '@angular/core';
import { WithSubStore, select, dispatch } from '@angular-redux/store';
import { Observable, Subscription } from 'rxjs';
import { CHANGE_PLATFORM } from './../../reducers';
import reducers from './../../planetside.reducers';
import { MatSelectChange } from '@angular/material';

@Component({
    selector: 'platform-control',
    templateUrl: './platform-control.template.html',
    styleUrls: ['./platform-control.styles.css']
})

@WithSubStore({
    basePathMethodName: 'getBasePath',
    localReducer: reducers
})

export class PlanetsidePlatformControl implements OnInit, OnDestroy {
    private platformSub: Subscription;
    public selectedValue: any;

    @select('platform') readonly platform$: Observable<any>;

    ngOnInit() {        
        this.platformSub = this.platform$.subscribe(platformState => {
            if (platformState) {
                this.selectedValue = platformState.platform;
            }
        });
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