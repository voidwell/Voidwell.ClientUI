import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class NavMenuService {
    private navOpened: boolean = false;

    public onToggle: EventEmitter<any> = new EventEmitter();

    constructor() {
        this.onToggle.emit(this.navOpened);
    }

    public toggle() {
        this.setState(!this.navOpened);
    }

    public open() {
        this.setState(true);
    }

    public close() {
        this.setState(false);
    }

    private setState(state: boolean) {
        this.navOpened = state;
        this.onToggle.emit(this.navOpened);
    }
}