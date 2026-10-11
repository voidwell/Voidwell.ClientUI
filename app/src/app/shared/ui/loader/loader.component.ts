import { Component, Input } from '@angular/core';

export type LoaderVariant = 'card' | 'list' | 'table';

@Component({
    selector: 'vw-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css']
})

export class LoaderComponent {
    @Input() loading: boolean;
    @Input() variant: LoaderVariant = 'card';
    @Input() set rows(value: number) {
        this.items = Array.from({ length: value }, (_, i) => i);
    }

    items: number[] = [0, 1, 2, 3, 4];
}
