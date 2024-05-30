import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { SearchType } from '../../models/search-type.model';
import { SearchResult } from '../../contracts/search-result.model';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'vw-ps2-search-input',
    templateUrl: './search-input.template.html',
    styleUrls: ['./search-input.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent implements OnChanges {
    @Input() searchType!: SearchType;
    @Input() isSearching: boolean = false;
    @Input() searchResults!: SearchResult[];
    @Output() searchTypeChanged = new EventEmitter<SearchType>();
    @Output() searchQueryChanged = new EventEmitter<string>();

    @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
    @ViewChild('searchContainer', { static: true }) searchContainer!: ElementRef;

    isFocused = false;

    inputControl = new FormControl();

    constructor(private router: Router) {
        this.inputControl.valueChanges
            .subscribe(query => {
                if (!query || query === '') {
                    this.clearSearch();
                }
                this.searchQueryChanged.emit(this.inputControl.value);
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['searchType'] && !changes['searchType'].firstChange) {
            this.focus();
        }
    }

    onSearchTypeChange(event: MatSelectChange) {
        const value = event.value as SearchType;
        this.searchTypeChanged.emit(value);
    }

    clearSearch() {
        if (this.inputControl.dirty) {
            this.inputControl.reset();
        }
    }

    resultClick(result: SearchResult) {
        if (result.type === SearchType.Player) {
            this.router.navigateByUrl(`ps2/player/${result.id}`);
        }
        if (result.type === SearchType.Outfit) {
            this.router.navigateByUrl(`ps2/outfit/${result.id}`);
        }
        if (result.type === SearchType.Weapon) {
            this.router.navigateByUrl(`ps2/item/${result.id}`);
        }
    }

    focus() {
        this.isFocused = true;
        this.searchInput.nativeElement.focus();
    }

    @HostListener('click')
    clickin() {
        this.focus();
    }

    @HostListener('document:click', ['$event'])
    clickout(event: any) {
        if (!this.isFocused) {
            return;
        }

        if(!this.elementOrAncestorHasClass(event.target, 'search-type-panel') && !this.searchContainer.nativeElement.contains(event.target)) {
            this.isFocused = false;
        }
    }

    private elementOrAncestorHasClass(element: any, className: any) {
        if (!element || element.length === 0) {
          return false;
        }
        var parent = element;
        do {
          if (parent === document) {
            break;
          }
          if (typeof parent.className === 'string' && parent.className.indexOf(className) >= 0) {
            return true;
          }
        } while (parent = parent.parentNode);
        return false;
    }
}
