import { Injectable, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable()
export class SearchService {
    public isUsable: boolean = false;
    public placeholder: string = "";
    public control: FormControl;

    public isSearching: boolean = false;
    public results: any[];

    public onEntry: EventEmitter<any> = new EventEmitter();
    public onClickResult: EventEmitter<any> = new EventEmitter();

    constructor() {
        this.control = new FormControl();

        this.control.valueChanges
            .subscribe(query => {
                if (!query || query === '') {
                    this.clearSearch();
                }
                this.onEntry.emit(query);
            });
    }

    clearSearch() {
        this.isSearching = false;

        if (this.control.dirty) {
            this.control.reset();
            this.results = [];
        }
    }
}