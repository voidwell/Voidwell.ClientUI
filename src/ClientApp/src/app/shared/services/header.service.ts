import { Injectable } from '@angular/core';
import { HeaderConfig } from './headerConfig';

@Injectable()

export class HeaderService {
    private defaultHeader: HeaderConfig = {
        title: 'Voidwell',
        subtitle: '',
        info: [],
        background: '#5099D1'
    };

    public activeHeader: HeaderConfig;

    constructor() {
        this.activeHeader = Object.assign({}, this.defaultHeader);
    }

    getHeaderConfig(): HeaderConfig {
        return this.activeHeader;
    }

    reset() {
        Object.assign(this.activeHeader, this.defaultHeader);
    }
}