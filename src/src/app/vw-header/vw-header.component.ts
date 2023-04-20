import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavMenuService } from './../shared/services/nav-menu.service';
import { SearchService } from './../shared/services/search.service';
import { AppState, selectAuthState } from './../store/app.states';
import { LogInUser, LogOutUser } from '../store/actions/auth.actions';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.template.html',
    styleUrls: ['./vw-header.styles.css']
})

export class VWHeaderComponent implements OnInit {
    isLoggedIn: boolean = false;
    userName: string;
    userRoles: Array<string>;

    constructor(public navMenuService: NavMenuService, public searchService: SearchService, private store: Store<AppState>) {
    }

    ngOnInit() {        
        this.store.select(selectAuthState)
            .subscribe(state => {
                this.isLoggedIn = state.isAuthenticated;
                if (state.user) {
                    this.userName = state.user.profile.name || '';
                }
                if (state.userRoles) {
                    this.userRoles = state.userRoles;
                }
            });
    }

    signIn(): any {
        this.store.dispatch(new LogInUser());
    }

    signOut(): any {
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
        if (this.userRoles && this.userRoles.indexOf(role) > -1) {
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