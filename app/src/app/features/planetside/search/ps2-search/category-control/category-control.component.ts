import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { MatSelect, MatOption, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'category-control',
    templateUrl: './category-control.component.html',
    styleUrl: './category-control.component.css',
    host: {
        'class': 'category-control'
    },
    encapsulation: ViewEncapsulation.None,
    imports: [MatSelect, MatSelectTrigger, MatOption, MatIcon]
})
export class CategoryControlComponent {
    readonly value = input<string | null>();
    readonly valueChange = output<string>();
    readonly openChange = output<boolean>();

    readonly categories = [
        { value: 'character', label: 'Player', icon: 'mdi-account' },
        { value: 'outfit', label: 'Outfit', icon: 'mdi-account-multiple' },
        { value: 'item', label: 'Weapon', icon: 'mdi-target' }
    ];

    readonly selected = computed(() => this.categories.find(c => c.value === this.value()));

    onOpenChange(isOpen: boolean): void {
        this.openChange.emit(isOpen);
    }

    onSelectionChange(event: MatSelectChange): void {
        this.valueChange.emit(event.value);
    }
}
