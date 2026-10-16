import { ChangeDetectionStrategy, Component, inject, computed, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatSelectChange, MatSelect, MatSelectTrigger, MatOption } from '@angular/material/select';
import { AppState } from '@core/store/app.states';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { ChangePlatform } from '@core/platform/store/actions/planetside.actions';
import { PLATFORMS } from '@shared/utils/platforms';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'platform-control',
    templateUrl: './platform-control.component.html',
    styleUrls: ['./platform-control.component.css'],
    host: {
        'class': 'platform-control'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatSelect, MatSelectTrigger, MatIcon, MatOption]
})
export class PlanetsidePlatformControl {
    private planetside = inject(Store).selectSignal(selectPlanetsideState);
    private store = inject<Store<AppState>>(Store);

    readonly platforms = PLATFORMS;

    readonly selectedValue = computed(() => this.platforms.find(p => p.id === this.planetside()?.platform));

    onValueChange(event: MatSelectChange) {
        const platform = event.value.id;
        this.store.dispatch(new ChangePlatform({ platform }));
    }
}