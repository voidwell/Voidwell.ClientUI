import { Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavLink } from '@shared/ui/nav-link.model';
import { AppState, selectAuthState } from '@core/store/app.states';
import { VWTabNavBarComponent } from '@shared/ui/vw-tab-nav-bar/vw-tab-nav-bar.component';
import { RouterOutlet } from '@angular/router';
import { permittedSections } from './admin-sections';

@Component({
    selector: 'voidwell-admin-wrapper',
    templateUrl: './admin-wrapper.component.html',
    imports: [VWTabNavBarComponent, RouterOutlet]
})

export class AdminWrapperComponent {
    private store = inject<Store<AppState>>(Store);

    private authState = this.store.selectSignal(selectAuthState);

    /** The dashboard, then the areas the user's roles allow. */
    readonly navLinks = computed<NavLink[]>(() => [
        { path: 'dashboard', display: 'Dashboard' },
        ...permittedSections(this.authState().userRoles).map(section => ({ path: section.path, display: section.display }))
    ]);
}
