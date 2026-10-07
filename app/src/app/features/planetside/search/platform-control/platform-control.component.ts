import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatSelectChange, MatSelect, MatSelectTrigger, MatOption } from '@angular/material/select';
import { AppState } from '@core/store/app.states';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { ChangePlatform } from '@core/platform/store/actions/planetside.actions';
import { MatIcon } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';

@Component({
    selector: 'platform-control',
    templateUrl: './platform-control.component.html',
    styleUrls: ['./platform-control.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatSelect, MatSelectTrigger, MatIcon, MatOption, UpperCasePipe]
})
export class PlanetsidePlatformControl {
    private planetside = inject(Store).selectSignal(selectPlanetsideState);
    private store = inject<Store<AppState>>(Store);

    readonly selectedValue = computed(() => this.planetside()?.platform);

    onValueChange(event: MatSelectChange) {
        this.store.dispatch(new ChangePlatform({ platform: event.value }));
    }

}