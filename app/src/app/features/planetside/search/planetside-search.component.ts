import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { SearchService } from '@core/layout/search.service';
import { NgClass } from '@angular/common';
import { PlanetsidePlatformControl } from './platform-control/platform-control.component';
import { Ps2SearchComponent } from './ps2-search/ps2-search.component';

@Component({
    templateUrl: './planetside-search.component.html',
    styleUrls: ['./planetside-search.component.css'],
    imports: [NgClass, PlanetsidePlatformControl, Ps2SearchComponent]
})

export class PlanetsideSearchComponent {
    searchService = inject(SearchService);

    @ViewChild(Ps2SearchComponent, { static: true }) ps2Search: Ps2SearchComponent;

    constructor() {
        this.searchService.onSearchOpen.subscribe(() => {
            this.ps2Search.focus();
        });
    }

    @HostListener('click')
    clickin() {
        this.searchService.onFocus();
    }

    @HostListener('document:click', ['$event'])
    clickout(event: MouseEvent) {
        if (!this.searchService.searchFocused()) {
            return;
        }

        if(!this.elementOrAncestorHasClass(event.target, 'top-search_dropdown') && !this.ps2Search.contains(event.target as Node)) {
            this.searchService.onBlur();
        }
    }

    private elementOrAncestorHasClass(element: EventTarget | null, className: string): boolean {
        let node = element as Node | null;
        while (node && node !== document) {
            if (node instanceof Element && typeof node.className === 'string' && node.className.indexOf(className) >= 0) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
}
