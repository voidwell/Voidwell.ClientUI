import { Injectable, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

@Injectable()
export class SearchService {
    public searchState: EventEmitter<SearchState> = new EventEmitter();
    public onEntry: Observable<any>;
    public onClickResult: Observable<any>;

    private control: FormControl;
    private isUsable: boolean = false;
    private isSearching: boolean = false;
    private results: any[];
    private placeholder: string = '';
    private searchStateSub: Subscription;
    private onEntryEmitter: EventEmitter<any> = new EventEmitter();
    private onClickResultEmitter: EventEmitter<any> = new EventEmitter();

    constructor() {
        this.control = new FormControl();
        this.onEntry = this.onEntryEmitter.asObservable();
        this.onClickResult = this.onClickResultEmitter.asObservable();

        this.control.valueChanges
            .subscribe(query => {
                if (!query || query === '') {
                    this.clearSearch();
                }
                this.onEntryEmitter.emit(query);
            });
    }

    attach(placeholder: string = '') {
        this.isUsable = true;
        this.placeholder = placeholder;

        this.searchStateSub = this.searchState.subscribe((state: SearchState) => {
            this.results = state.data;
            this.isSearching = state.isSearching;
        });
    }

    detach() {
        this.isUsable = false;
        this.placeholder = '';
        this.isSearching = false;
        this.control.reset();
        this.results = [];

        this.searchStateSub.unsubscribe();
    }

    clearSearch() {
        this.isSearching = false;

        if (this.control.dirty) {
            this.control.reset();
            this.results = [];
        }
    }
}

@Injectable()
export class SearchState {
    public isSearching: boolean = false;
    public data: any[] = [];

    constructor(isSearching: boolean, results: any[] = []) {
        this.isSearching = isSearching;
        this.data = results;
    }
}