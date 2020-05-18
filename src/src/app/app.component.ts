import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import reducers from './app.reducers';
import {
    IUserLoginState,
    IRegistrationState
} from './reducers';
import { NgRedux } from '@angular-redux/store';
import { MatIconRegistry } from '@angular/material/icon';

export interface IAppState {
    loggedInUser: IUserLoginState;
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
                registration: null
            },
            null,
            []);
    }
}