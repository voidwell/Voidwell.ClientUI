import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-loader',
    templateUrl: './loader.template.html',
    styleUrls: ['./loader.styles.css']
})

export class LoaderComponent {
    @Input() loading: boolean;

    private height: string = '150px';
    private width: string = '150px';

    private outerStrokenWidth: number = 1;
    private innerStrokeWidth: number = 1;

    private innerRadius: number = 35;
    private outerRadius: number = 40;

    private innerDash = this.innerRadius * Math.PI / 4;
    private outerDash = this.outerRadius * Math.PI / 2;
    private innerDashArray: string = this.innerDash + " " + this.innerDash + " " + this.innerDash + " " + this.innerDash;
    private outerDashArray: string = this.outerDash + " " + this.outerDash;
}