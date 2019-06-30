import { Component, ElementRef, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from './../../shared/services/search.service';

@Component({
    templateUrl: './planetside-search.template.html',
    styleUrls: ['./planetside-search.styles.css']
})

export class PlanetsideSearchComponent implements OnDestroy {
    @ViewChild('searchInput') searchInput: ElementRef;
    @ViewChild('searchContainer') searchContainer: ElementRef;

    private openSub: Subscription;

    constructor(public searchService: SearchService) {
        this.searchService.onSearchOpen.subscribe(() => {
            this.searchInput.nativeElement.focus();
        });
    }

    @HostListener('click')
    clickin() {
        this.searchService.onFocus();
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (!this.searchService.searchFocused) {
            return;
        }

        if(!this.elementOrAncestorHasClass(event.target, 'top-search_dropdown') && !this.searchContainer.nativeElement.contains(event.target)) {
            this.searchService.onBlur();
        }
    }

    private elementOrAncestorHasClass(element, className) {
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

    ngOnDestroy() {
        if (this.openSub) this.openSub.unsubscribe();
    }
}