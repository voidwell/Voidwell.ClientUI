import { Component, Input } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { FactionBackgroundPipe } from '../../pipes/faction-background.pipe';

@Component({
    selector: 'vw-faction-bar',
    templateUrl: './faction-bar.component.html',
    styleUrls: ['./faction-bar.component.css'],
    imports: [NgClass, DecimalPipe, FactionBackgroundPipe]
})

export class FactionBarComponent {
    @Input() vs: number = 0;
    @Input() nc: number = 0;
    @Input() tr: number = 0;
    @Input() neutural: boolean = true;

    getWidth(value: number): number {
        const scoreSum = this.vs + this.nc + this.tr;
        if (scoreSum === 0) {
            return 100 / 3;
        }
        return value / (scoreSum + this.getNeuturalScore()) * 100;
    }

    getNeuturalScore(): number {
        if (!this.neutural) {
            return 0;
        }

        return 100 - (this.vs + this.nc + this.tr);
    }
}