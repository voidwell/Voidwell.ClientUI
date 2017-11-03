import { Component, ViewContainerRef, OnInit, ViewEncapsulation } from '@angular/core';
//import { IpreoAccountAuthService } from './shared/services/ipreoaccount-auth.service';
import reducers from './app.reducers';
import {
    IUserLoginState,
    IBlogPostState,
    IBlogPostListState
} from './reducers';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { MatIconRegistry } from '@angular/material';

export interface IAppState {
    loggedInUser: IUserLoginState;
    blogPost: IBlogPostState;
    blogPostList: IBlogPostListState;
};

@Component({
    selector: 'app',
    templateUrl: './app.template.html',
    styleUrls: ['./app.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {
    isLoggedIn: boolean = false;
    userName: string;
    userState: Observable<any>;

    constructor(private ngRedux: NgRedux<IAppState>,
        private iconRegistry: MatIconRegistry,
        //private authService: IpreoAccountAuthService,
        public viewContainer: ViewContainerRef) {
        this.iconRegistry.setDefaultFontSetClass('mdi');

        ngRedux.configureStore(
            reducers,
            {
                loggedInUser: null,
                blogPost: null,
                blogPostList: null
            },
            null,
            []);
    }

    ngOnInit() {
        this.userState = this.ngRedux.select('loggedInUser');
        this.userState.subscribe(user => {
            if (user) {
                this.isLoggedIn = user.isLoggedIn;
                if (user.user) {
                    this.userName = user.user.profile.name || '';
                }
            }
        });
    }

    private hasRole(userRoles: string[], expectedRoles: string[]): boolean {
        let found = false;
        expectedRoles.forEach(role => {
            if (userRoles && userRoles.indexOf(role) > -1) {
                found = true;
            }
        });
        return found;
    }

    signOut(): any {
        // this.authservice.signOut();
    }
}