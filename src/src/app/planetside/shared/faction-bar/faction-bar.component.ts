import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-faction-bar',
    templateUrl: './faction-bar.template.html',
    styleUrls: ['./faction-bar.styles.css']
})

export class FactionBarComponent {
    @Input('vs') vsScore: number = 0;
    @Input('nc') ncScore: number = 0;
    @Input('tr') trScore: number = 0;
    @Input() neutural: boolean = true;

    getWidth(value: number): number {
        let scoreSum = this.vsScore + this.ncScore + this.trScore;
        if (scoreSum === 0) {
            return 100 / 3;
        }
        return value / (scoreSum + this.getNeuturalScore()) * 100;
    }

    getNeuturalScore(): number {
        if (!this.neutural) {
            return 0;
        }

        return 100 - (this.vsScore + this.ncScore + this.trScore);
    }
}