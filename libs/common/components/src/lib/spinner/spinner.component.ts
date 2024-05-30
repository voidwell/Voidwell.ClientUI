import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'vw-spinner',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.styles.scss']
})

export class SpinnerComponent {
    @Input() loading: boolean = true;

    height: string = '150px';
    width: string = '150px';

    strokeWidth: number = 2;
    ringCount: number = 3;
    animDuration: number = 2.0;
    ringFrequency: number = 0.4;

    getStartDuration(ringId: number) {
        const value = (this.animDuration / this.ringCount) * this.ringFrequency * ringId;
        return `${value}s`;
    }
}