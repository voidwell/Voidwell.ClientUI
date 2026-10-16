import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { MatSelect, MatOption, MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'category-control',
    templateUrl: './category-control.component.html',
    styleUrl: './category-control.component.css',
    host: {
        'class': 'category-control'
    },
    encapsulation: ViewEncapsulation.None,
    imports: [MatSelect, MatOption]
})
export class CategoryControlComponent {
    readonly value = input<string | null>();
    readonly valueChange = output<string>();
    readonly openChange = output<boolean>();

    onOpenChange(isOpen: boolean): void {
        this.openChange.emit(isOpen);
    }

    onSelectionChange(event: MatSelectChange): void {
        this.valueChange.emit(event.value);
    }
}
