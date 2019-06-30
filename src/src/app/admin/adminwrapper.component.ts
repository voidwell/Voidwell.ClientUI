import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { IAppState } from './../app.component';
import { VoidwellAuthService } from './../shared/services/voidwell-auth.service';

@Component({
    selector: 'voidwell-admin-wrapper',
    templateUrl: './adminwrapper.template.html',
    styleUrls: ['../app.styles.css']
})

export class AdminWrapperComponent {
    userRoles: Array<string>;
    userState: Observable<any>;

    navLinks = [
        { path: 'dashboard', display: 'Dashboard', roles: null },
        { path: 'events', display: 'Events', roles: ['Administrator', 'Events'] },
        { path: 'psb', display: 'PSB', roles: ['Administrator', 'PSB'] },
        { path: 'blog', display: 'Blog', roles: ['Administrator', 'Blog'] },
        { path: 'users', display: 'Users', roles: ['Administrator'] },
        { path: 'roles', display: 'Roles', roles: ['Administrator'] },
        { path: 'services', display: 'Services', roles: ['Administrator'] },
        { path: 'oidc', display: 'OIDC', roles: ['Administrator'] }
    ];

    constructor(private auth: VoidwellAuthService, private ngRedux: NgRedux<IAppState>) {
        this.userState = this.ngRedux.select('loggedInUser');
        this.userState.subscribe(user => {
            if (user) {
                if (user.roles) {
                    this.userRoles = user.roles || [];
                }
            }
        });
    }

    getNavLinks(): any[] {
        let permittedLinks = [];

        for (let i = 0; i < this.navLinks.length; i++) {
            if (this.navLinks[i].roles == null || this.hasRoles(this.navLinks[i].roles)) {
                permittedLinks.push(this.navLinks[i]);
            }
        }

        return permittedLinks;
    }

    hasRoles(roles: any[]) {
        if (!roles) {
            return true;
        }

        for (var i = 0; i < roles.length; i++) {
            if (this.hasRole(roles[i])) {
                return true;
            }
        }

        return false;
    }

    hasRole(role: string): boolean {
        if (this.userRoles && this.userRoles.indexOf(role) > -1) {
            return true;
        }

        return false;
    }
}