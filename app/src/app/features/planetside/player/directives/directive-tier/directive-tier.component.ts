import { Component, ChangeDetectionStrategy, Input, OnInit, HostBinding } from '@angular/core';
import { CharacterDirectivesOutlineTier } from '@core/api/models/ps2/character.model';
import { NgClass, DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DirectiveObjectiveComponent } from '../directive-objective/directive-objective.component';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'directive-tier',
    templateUrl: './directive-tier.component.html',
    styleUrls: ['./directive-tier.component.css'],
    host: { 'class': 'directive-tier' },
    imports: [NgClass, MatIcon, DirectiveObjectiveComponent, DatePipe, DgcImageUrlPipe]
})

export class DirectiveTierComponent implements OnInit {
    @Input() tier: CharacterDirectivesOutlineTier;

    @HostBinding('class.completed') isCompleted: boolean = false;

    requirementBars: number[] = [];
    requirementsCompleted = 0;

    ngOnInit() {
        this.isCompleted = !!this.tier.completionDate;
        this.requirementBars = Array(this.tier.completionCount).fill(1).map((x, i) => i);
        this.requirementsCompleted = this.tier.directives.filter(x => !!x.completionDate).length;
    }
}