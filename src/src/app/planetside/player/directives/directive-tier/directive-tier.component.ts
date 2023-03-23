import { Component, Input, OnInit, HostBinding } from '@angular/core';

@Component({
    selector: 'directive-tier',
    templateUrl: './directive-tier.template.html',
    styleUrls: ['./directive-tier.styles.css'],
    host: {'class': 'directive-tier'}
})

export class DirectiveTierComponent implements OnInit {
    @Input() tier: any;

    @HostBinding('class.completed') isCompleted: boolean = false;

    requirementBars = [];
    requirementsCompleted = 0;

    ngOnInit() {
        this.isCompleted = this.tier.completionDate;
        this.requirementBars = Array(this.tier.completionCount).fill(1).map((x, i) => i);
        this.requirementsCompleted = this.tier.directives.filter(x => !!x.completionDate).length;
    }
}