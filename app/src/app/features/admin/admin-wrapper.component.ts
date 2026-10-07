import { Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavLink } from '@shared/ui/nav-link.model';
import { AppState, selectAuthState } from '@core/store/app.states';
import { VoidwellAuthService } from '@core/auth/voidwell-auth.service';
import { VWTabNavBarComponent } from '@shared/ui/vw-tab-nav-bar/vw-tab-nav-bar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'voidwell-admin-wrapper',
    templateUrl: './admin-wrapper.component.html',
    imports: [VWTabNavBarComponent, RouterOutlet]
})

export class AdminWrapperComponent {
    private auth = inject(VoidwellAuthService);
    private store = inject<Store<AppState>>(Store);

    private authState = this.store.selectSignal(selectAuthState);

    readonly userRoles = computed(() => this.authState().userRoles);

    navLinks: NavLink[] = [
        { path: 'dashboard', display: 'Dashboard', roles: undefined },
        { path: 'events', display: 'Events', roles: ['Administrator', 'Events'] },
        { path: 'psb', display: 'PSB', roles: ['Administrator', 'PSB'] },
        { path: 'blog', display: 'Blog', roles: ['Administrator', 'Blog'] },
        { path: 'users', display: 'Users', roles: ['Administrator'] },
        { path: 'roles', display: 'Roles', roles: ['Administrator'] },
        { path: 'status', display: 'Status', roles: ['Administrator'] },
        { path: 'oidc', display: 'OIDC', roles: ['Administrator'] }
    ];

    getNavLinks(): NavLink[] {
        const permittedLinks: NavLink[] = [];

        for (let i = 0; i < this.navLinks.length; i++) {
            if (this.navLinks[i].roles == null || this.hasRoles(this.navLinks[i].roles)) {
                permittedLinks.push(this.navLinks[i]);
            }
        }

        return permittedLinks;
    }

    hasRoles(roles?: string[]) {
        if (!roles) {
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
}