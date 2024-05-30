import { BehaviorSubject } from 'rxjs';
import { NAV_DATA, NavNode } from './navnode.model';

export class NavDatabase {
    dataChange = new BehaviorSubject<NavNode[]>([]);

    get data(): NavNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize();
    }

    initialize() {
        const data = NAV_DATA.slice();
        this.dataChange.next(data);
    }
}