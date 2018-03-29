import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class HeaderService {
    activeHeader: BehaviorSubject<HeaderConfig> = new BehaviorSubject<HeaderConfig>(new HeaderConfig());

    setHeaderConfig(config: HeaderConfig) {
        this.activeHeader.next(config);
    }

    reset() {
        this.activeHeader.next(new HeaderConfig());
    }
}

export class HeaderConfig {
    public title: string = 'Voidwell';
    public subtitle: string = '';
    public background: string = '#29182b';
    public info: Array<HeaderInfoItem> = [];
}

export class HeaderInfoItem {
    public label: string;
    public value: any;

    constructor(label: string, value: string) {
        this.label = label;
        this.value = value;
    }
}