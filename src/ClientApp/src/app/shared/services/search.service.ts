import { Injectable, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

@Injectable()
export class SearchService {
    public searchState: EventEmitter<SearchState> = new EventEmitter();
    public onSearchOpen: EventEmitter<boolean> = new EventEmitter();
    public onEntry: Observable<any>;
    public onClickResult: Observable<any>;
    public isUsable: boolean = false;
    public searchFocused: boolean = false;
    public control: FormControl;
    public categoryControl: FormControl;
    public placeholder: string = '';
    public isSearching: boolean = false;
    public results: any[];

    private searchStateSub: Subscription;
    private onEntryEmitter: EventEmitter<any> = new EventEmitter();
    private onClickResultEmitter: EventEmitter<any> = new EventEmitter();

    constructor() {
        this.control = new FormControl();
        this.categoryControl = new FormControl();
        this.onEntry = this.onEntryEmitter.asObservable();
        this.onClickResult = this.onClickResultEmitter.asObservable();

        this.control.valueChanges
            .subscribe(query => {
                if (!query || query === '') {
                    this.clearSearch();
                }
                this.onEntryEmitter.emit({
                    category: this.categoryControl.value,
                    query: this.control.value
                });
            });

        this.categoryControl.valueChanges
            .subscribe(category => {
                if (this.control.value && this.control.value !== "") {
                    this.onEntryEmitter.emit({
                        category: category,
                        query: this.control.value
                    });
                }
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
        this.categoryControl.reset();
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

    focusSearch() {
        this.searchFocused = true;
        this.onSearchOpen.emit(true);
    }

    dropdownToggled(isOpened) {
        if (isOpened) {
            this.searchFocused = true;
        } else {
            this.focusSearch();
        }
    }

    onFocus() {
        this.searchFocused = true;
    }

    onBlur() {
        this.searchFocused = false;
    }
}

export class SearchState {
    public isSearching: boolean = false;
    public data: any[] = [];

    constructor(isSearching: boolean, results: any[] = []) {
        this.isSearching = isSearching;
        this.data = results;
    }
}