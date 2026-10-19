import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { PLATFORMS } from '../platforms';
import { platformSwitchUrl } from '../platform-routing';
import { selectPlanetsideState } from '../store/planetside.states';

/** Switches the PlanetSide platform by navigating; the URL then selects it (see `platformGuard`). */
@Component({
    selector: 'vw-platform-picker',
    templateUrl: './platform-picker.component.html',
    styleUrl: './platform-picker.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonToggleGroup, MatButtonToggle]
})
export class PlatformPickerComponent {
    private router = inject(Router);
    private planetside = inject(Store).selectSignal(selectPlanetsideState);

    readonly platforms = PLATFORMS;
    readonly selected = computed(() => this.planetside().platform);

    onChange(event: MatButtonToggleChange): void {
        this.router.navigateByUrl(platformSwitchUrl(this.router, event.value));
    }
}
