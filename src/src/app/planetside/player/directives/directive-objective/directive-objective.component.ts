import { Component, Input, OnInit, HostBinding } from '@angular/core';

@Component({
    selector: 'directive-objective',
    templateUrl: './directive-objective.template.html',
    styleUrls: ['./directive-objective.styles.css'],
    host: {'class': 'directive-objective'}
})

export class DirectiveObjectiveComponent implements OnInit {
    @Input() directive: any;

    @HostBinding('class.completed') isCompleted: boolean = false;

    ngOnInit() {
        this.isCompleted = this.directive.completionDate;
    }
}