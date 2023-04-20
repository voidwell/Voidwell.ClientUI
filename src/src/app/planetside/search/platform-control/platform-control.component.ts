import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { AppState } from '../../../store/app.states';
import { selectPlanetsideState } from '../../store/planetside.states';
import { ChangePlatform } from '../../store/actions/planetside.actions';

@Component({
    selector: 'platform-control',
    templateUrl: './platform-control.template.html',
    styleUrls: ['./platform-control.styles.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanetsidePlatformControl implements OnDestroy {
    public readonly platform$: Observable<string>;

    private platformSub: Subscription;
    public selectedValue: string;

    constructor(private store : Store<AppState>) {
        this.platformSub = this.store.select(selectPlanetsideState)
            .subscribe(state => {
                this.selectedValue = state.platform
            });
    }

    onValueChange(event: MatSelectChange) {
        this.store.dispatch(new ChangePlatform({ platform: event.value }));
    }

    ngOnDestroy() {
        if (this.platformSub) this.platformSub.unsubscribe();
    }
}