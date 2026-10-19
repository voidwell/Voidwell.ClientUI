import { Component, ElementRef, ViewChild, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete, MatAutocompleteOrigin } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { SearchService } from '@core/layout/search.service';
import { PlatformSearchResult } from '@core/api/models/ps2/reference.model';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { PLATFORMS, PlatformInfo } from '@core/platform/platforms';
import { CategoryControlComponent } from './category-control/category-control.component';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';
import { WorldNamePipe } from '../../pipes/world-name.pipe';

@Component({
    selector: 'ps2-search',
    templateUrl: './ps2-search.component.html',
    styleUrl: './ps2-search.component.css',
    host: {
        'class': 'ps2-search',
        '[class.focus]': 'isFocused()'
    },
    encapsulation: ViewEncapsulation.None,
    imports: [NgClass, MatIconButton, MatIcon, CategoryControlComponent, FormsModule, ReactiveFormsModule, MatOption, MatInput, MatAutocompleteTrigger, MatAutocomplete, MatAutocompleteOrigin, FactionColorPipe, WorldNamePipe, DecimalPipe]
})
export class Ps2SearchComponent {
    searchService = inject(SearchService);

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef<HTMLInputElement>;
    @ViewChild('searchContainer', { static: true }) searchContainer: ElementRef<HTMLElement>;

    readonly typeIcons: Record<string, string> = {
        character: 'mdi-account',
        outfit: 'mdi-account-multiple',
        item: 'mdi-target'
    };

    private readonly categoryLabels: Record<string, string> = {
        character: 'Players',
        outfit: 'Outfits',
        item: 'Weapons'
    };

    private readonly planetside = inject(Store).selectSignal(selectPlanetsideState);

    private readonly query = toSignal(this.searchService.control.valueChanges, { initialValue: this.searchService.control.value });
    private readonly category = toSignal(this.searchService.categoryControl.valueChanges, { initialValue: this.searchService.categoryControl.value });

    /** Where the results panel is anchored; undefined anchors it to the input. */
    readonly resultsOrigin = signal<MatAutocompleteOrigin | undefined>(undefined);

    readonly categoryLabel = computed(() => this.categoryLabels[this.category() ?? ''] ?? 'Results');

    isFocused(): boolean {
        return this.searchService.searchFocused() || this.searchService.control.dirty;
    }

    focus(): void {
        this.searchInput.nativeElement.focus();
    }

    contains(node: Node): boolean {
        return this.searchContainer.nativeElement.contains(node);
    }

    onCategoryChange(value: string) {
        this.searchService.categoryControl.setValue(value);
    }

    onCategoryOpenChange(isOpen: boolean) {
        this.searchService.dropdownToggled(isOpen);
    }

    /** The platform a result was found on, when that is not the selected one; results span every platform. */
    otherPlatform(result: PlatformSearchResult): PlatformInfo | undefined {
        return result.platform === this.planetside().platform ? undefined : PLATFORMS.find(p => p.id === result.platform);
    }

    /**
     * Anchors the results to the whole search bar when it fits on screen. On narrow screens the bar overflows its
     * clipped container, so the results stay anchored to the input.
     */
    updateResultsOrigin(barOrigin: MatAutocompleteOrigin): void {
        const rect = this.searchContainer.nativeElement.getBoundingClientRect();
        this.resultsOrigin.set(rect.left >= 0 && rect.right <= window.innerWidth ? barOrigin : undefined);
    }

    /** Splits a result name around the first case-insensitive match of the query: [before, match, after]. */
    highlight(name: string | undefined): [string, string, string] {
        const text = name ?? '';
        const query = (this.query() ?? '').trim();
        const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
        if (index < 0) {
            return [text, '', ''];
        }
        return [text.slice(0, index), text.slice(index, index + query.length), text.slice(index + query.length)];
    }

}
