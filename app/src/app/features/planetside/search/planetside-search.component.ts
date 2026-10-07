import { Component, ElementRef, HostListener, ViewChild, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from '@core/layout/search.service';
import { NgClass } from '@angular/common';
import { PlanetsidePlatformControl } from './platform-control/platform-control.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { WorldNamePipe } from '../pipes/world-name.pipe';

@Component({
    templateUrl: './planetside-search.component.html',
    styleUrls: ['./planetside-search.component.css'],
    imports: [NgClass, PlanetsidePlatformControl, MatIconButton, MatIcon, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatInput, MatAutocompleteTrigger, MatAutocomplete, FactionColorPipe, WorldNamePipe]
})

export class PlanetsideSearchComponent implements OnDestroy {
    searchService = inject(SearchService);

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
    @ViewChild('searchContainer', { static: true }) searchContainer: ElementRef;

    private openSub: Subscription;

    constructor() {
        this.searchService.onSearchOpen.subscribe(() => {
            this.searchInput.nativeElement.focus();
        });
    }

    @HostListener('click')
    clickin() {
        this.searchService.onFocus();
    }

    @HostListener('document:click', ['$event'])
    clickout(event: MouseEvent) {
        if (!this.searchService.searchFocused) {
            return;
        }

        if(!this.elementOrAncestorHasClass(event.target, 'top-search_dropdown') && !this.searchContainer.nativeElement.contains(event.target as Node)) {
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

    ngOnDestroy() {
        if (this.openSub) this.openSub.unsubscribe();
    }
}