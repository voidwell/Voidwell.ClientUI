import { Component, ElementRef, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { SearchService } from '@core/layout/search.service';
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
    imports: [NgClass, MatIconButton, MatIcon, CategoryControlComponent, FormsModule, ReactiveFormsModule, MatOption, MatInput, MatAutocompleteTrigger, MatAutocomplete, FactionColorPipe, WorldNamePipe]
})
export class Ps2SearchComponent {
    searchService = inject(SearchService);

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef<HTMLInputElement>;
    @ViewChild('searchContainer', { static: true }) searchContainer: ElementRef<HTMLElement>;

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

}
