import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import reducers from './app.reducers';
import {
    IUserLoginState,
    IBlogPostState,
    IBlogPostListState,
    IRegistrationState
} from './reducers';
import { NgRedux } from '@angular-redux/store';
import { MatIconRegistry } from '@angular/material';

export interface IAppState {
    loggedInUser: IUserLoginState;
    blogPost: IBlogPostState;
    blogPostList: IBlogPostListState;
    registration: IRegistrationState;
};

@Component({
    selector: 'app',
    templateUrl: './app.template.html',
    styleUrls: ['./app-import.styles.scss', './app.styles.css', './planetside.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class AppComponent {
    constructor(private ngRedux: NgRedux<IAppState>,
        private iconRegistry: MatIconRegistry,
        public viewContainer: ViewContainerRef) {
        this.iconRegistry.setDefaultFontSetClass('mdi');

        ngRedux.configureStore(
            reducers,
            {
                loggedInUser: null,
                blogPost: null,
                blogPostList: null,
                registration: null
            },
            null,
            []);
    }
}