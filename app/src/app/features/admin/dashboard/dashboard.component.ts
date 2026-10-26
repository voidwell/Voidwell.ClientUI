import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { AppState, selectAuthState } from '@core/store/app.states';
import { permittedSections } from '../admin-sections';

/** The areas of the admin site the user's roles allow, each a tile that opens it. */
@Component({
    selector: 'voidwell-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink]
})

export class DashboardComponent {
    private authState = inject<Store<AppState>>(Store).selectSignal(selectAuthState);

    readonly sections = computed(() => permittedSections(this.authState().userRoles));
}
