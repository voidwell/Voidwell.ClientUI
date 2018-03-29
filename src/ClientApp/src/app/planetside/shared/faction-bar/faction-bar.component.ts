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

    getNeuturalScore(): number {
        let scoreSum = this.vsScore + this.ncScore + this.trScore;
        return 100 - scoreSum;
    }
}