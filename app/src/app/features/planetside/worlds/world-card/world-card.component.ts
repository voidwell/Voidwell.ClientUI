import { Component, Input } from '@angular/core';
import { WorldOnlineState } from '@core/api/models/ps2/world-state.model';
import { MatCard, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';

@Component({
    selector: 'world-card',
    templateUrl: './world-card.component.html',
    styleUrls: ['./world-card.component.css'],
    imports: [MatCard, MatCardTitle, MatIcon, RouterLink, MatCardContent, NgClass, MatCardFooter, MatButton, DecimalPipe, DatePipe, FactionColorPipe]
})

export class WorldCardComponent {
    @Input() world: WorldOnlineState;

    getMinutes(value: string | Date): number {
        const now = new Date();
        const valueDate = new Date(value);
        const diffMs = (now.getTime() - valueDate.getTime());
        return Math.round((diffMs / 1000) / 60);
    }
}