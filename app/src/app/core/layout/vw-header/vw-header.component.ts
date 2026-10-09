import { Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavMenuService } from '../nav-menu.service';
import { SearchService } from '../search.service';
import { AppState, selectAuthState } from '../../store/app.states';
import { accountManagementUrl } from '../../auth/auth.config';
import { LogInUser, LogOutUser, RegisterUser } from '../../store/actions/auth.actions';
import { RouterLink, RouterOutlet } from '@angular/router';
import { VWLogoComponent } from './vw-logo/vw-logo.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDivider } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.component.html',
    styleUrls: ['./vw-header.component.css'],
    imports: [RouterLink, VWLogoComponent, MatIcon, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider, FormsModule, NgClass, RouterOutlet]
})

export class VWHeaderComponent {
    navMenuService = inject(NavMenuService);
    searchService = inject(SearchService);
    private store = inject<Store<AppState>>(Store);

    private authState = this.store.selectSignal(selectAuthState);

    readonly accountUrl = accountManagementUrl;

    readonly isLoggedIn = computed(() => this.authState().isAuthenticated);
    readonly userName = computed(() => this.authState().user?.name || '');
    readonly userRoles = computed(() => this.authState().userRoles);

    signIn(): void {
        this.store.dispatch(new LogInUser());
    }

    register(): void {
        this.store.dispatch(new RegisterUser());
    }

    signOut(): void {
        this.store.dispatch(new LogOutUser());
    }

    canAccessAdmin(): boolean {
        return this.hasRoles(['Administrator', 'SuperAdmin', 'Blog', 'Events', 'PSB']);
    }

    hasRoles(roles: string[]): boolean {
        if (roles == null) {
            return true;
        }

        for (let i = 0; i < roles.length; i++) {
            if (this.hasRole(roles[i])) {
                return true;
            }
        }

        return false;
    }

    hasRole(role: string): boolean {
        if (this.userRoles()?.indexOf(role) > -1) {
            return true;
        }

        return false;
    }
    
    focusSearch(event: MouseEvent) {
        event.stopPropagation();
        this.searchService.focusSearch()
    }

    public toggleNav() {
        this.navMenuService.toggle();
    }
}