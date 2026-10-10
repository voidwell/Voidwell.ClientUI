import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OutfitDetails } from '@core/api/models/ps2/outfit.model';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardFooter } from '@angular/material/card';
import { NgClass, DatePipe } from '@angular/common';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';
import { NavLink } from '@shared/ui/nav-link.model';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'outfit-card',
    templateUrl: './outfit-card.component.html',
    styleUrls: ['./outfit-card.component.css'],
    imports: [MatCard, NgClass, MatCardTitle, MatCardSubtitle, MatCardFooter, VWTabNavSubBarComponent, DatePipe]
})

export class OutfitCardComponent {
    navLinks: NavLink[] = [];

    @Input() data: OutfitDetails;
}