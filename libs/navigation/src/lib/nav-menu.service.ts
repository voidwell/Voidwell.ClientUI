import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavMenuService {
    private navOpened: boolean = true;
    private navSubject = new BehaviorSubject<boolean>(this.navOpened);

    navOpened$ = this.navSubject.asObservable();

    public toggle() {
        this.setState(!this.navOpened)
    }

    public open() {
        this.setState(true);
    }

    public close() {
        this.setState(false);
    }

    private setState(state: boolean) {
        this.navOpened = state;
        this.navSubject.next(this.navOpened);
    }
}