import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../shared/services/header.service';
import { VoidwellAuthService } from '../shared/services/voidwell-auth.service';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../app.component';

@Component({
    selector: 'vw-navbar',
    templateUrl: './vw-navbar.template.html',
    styleUrls: ['./vw-navbar.styles.css']
})

export class VWNavbarComponent implements OnInit {
    private header;
    isLoggedIn: boolean = false;
    userName: string;
    userRoles: Array<string>;
    userState: Observable<any>;

    constructor(private headerService: HeaderService,
        private authService: VoidwellAuthService,
        private ngRedux: NgRedux<IAppState>) { }

    ngOnInit() {
        this.header = this.headerService.activeHeader;

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

    hasRole(role: string): boolean {
        if (this.userRoles && this.userRoles.indexOf(role) > -1) {
            return true;
        }

        return false;
    }
}