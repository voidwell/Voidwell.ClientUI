import { Component, Input } from '@angular/core';

export type LoaderVariant = 'card' | 'cards' | 'alerts' | 'lines' | 'list' | 'table';

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
    lineWidths = [90, 75, 85, 60, 80, 70];

    get embedded(): boolean {
        return this.variant === 'cards' || this.variant === 'alerts' || this.variant === 'lines';
    }
}
