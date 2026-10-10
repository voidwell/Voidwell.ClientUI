import { Component, ChangeDetectionStrategy, Input, OnInit, HostBinding } from '@angular/core';
import { CharacterDirectivesOutlineDirective } from '@core/api/models/ps2/character.model';
import { MatTooltip } from '@angular/material/tooltip';
import { DecimalPipe, DatePipe } from '@angular/common';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'directive-objective',
    templateUrl: './directive-objective.component.html',
    styleUrls: ['./directive-objective.component.css'],
    host: { 'class': 'directive-objective' },
    imports: [MatTooltip, DecimalPipe, DatePipe, DgcImageUrlPipe]
})

export class DirectiveObjectiveComponent implements OnInit {
    @Input() directive: CharacterDirectivesOutlineDirective;

    @HostBinding('class.completed') isCompleted: boolean = false;

    ngOnInit() {
        this.isCompleted = !!this.directive.completionDate;
    }
}