import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-faction-bar',
    templateUrl: './faction-bar.template.html',
    styleUrls: ['./faction-bar.styles.css']
})

export class FactionBarComponent {
    @Input('vs') vsScore: number;
    @Input('nc') ncScore: number;
    @Input('tr') trScore: number;
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

        let scoreSum = this.vsScore + this.ncScore + this.trScore;
        if (scoreSum < 10 || scoreSum > 100) {
            return 0;
        }

        return 100 - scoreSum;
    }
}