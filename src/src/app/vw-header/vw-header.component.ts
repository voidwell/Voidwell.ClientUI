import { Component, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { NavMenuService } from './../shared/services/nav-menu.service';
import { SearchService } from './../shared/services/search.service';
import { VoidwellAuthService } from './../shared/services/voidwell-auth.service';
import { IAppState } from './../app.component';

@Component({
    selector: 'vw-header',
    templateUrl: './vw-header.template.html',
    styleUrls: ['./vw-header.styles.css']
})

export class VWHeaderComponent implements OnInit {
    userState: Observable<any>;
    isLoggedIn: boolean = false;
    userName: string;
    userRoles: Array<string>;

    constructor(public navMenuService: NavMenuService, public searchService: SearchService, private authService: VoidwellAuthService, private ngRedux: NgRedux<IAppState>) {
    }

    ngOnInit() {
        let self = this;
        
        this.userState = this.ngRedux.select('loggedInUser');
        this.userState.subscribe(user => {
            if (user) {
                this.isLoggedIn = user.isLoggedIn;
                if (user.user) {
                    this.userName = user.user.profile.name || '';
                }
                if (user.roles) {
                    this.userRoles = user.roles || [];
                }
            }
        });
    }

    signIn(): any {
        this.authService.signIn();
    }

    signOut(): any {
        this.authService.signOut();
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