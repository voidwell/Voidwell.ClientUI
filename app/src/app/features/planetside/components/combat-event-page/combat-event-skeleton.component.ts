import { Component, input } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { LoaderComponent } from '@shared/ui/loader/loader.component';

/** Holds the place of an alert or event's header and cards while it loads; the overview's cards, or one card for a full page. */
@Component({
    selector: 'combat-event-skeleton',
    imports: [LoaderComponent, MatCard],
    template: `
        <vw-loader class="block mb-4" variant="panel" [loading]="true"></vw-loader>
        @if (overview()) {
            <div class="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <mat-card class="stat-card"><vw-loader variant="rows" [rows]="9" [loading]="true"></vw-loader></mat-card>
                <mat-card class="stat-card"><vw-loader variant="rows" [rows]="9" [loading]="true"></vw-loader></mat-card>
            </div>
            <mat-card class="stat-card mb-4"><vw-loader variant="rows" [rows]="6" [loading]="true"></vw-loader></mat-card>
            @for (pair of pairs; track pair) {
                <div class="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <mat-card class="stat-card"><vw-loader variant="rows" [rows]="7" [loading]="true"></vw-loader></mat-card>
                    <mat-card class="stat-card"><vw-loader variant="rows" [rows]="7" [loading]="true"></vw-loader></mat-card>
                </div>
            }
        } @else {
            <mat-card class="stat-card mb-4"><vw-loader variant="rows" [rows]="10" [loading]="true"></vw-loader></mat-card>
        }
    `
})
export class CombatEventSkeletonComponent {
    readonly overview = input(true);

    /** The two rows of paired cards under the kill flow: players and outfits, then weapons and vehicles. */
    readonly pairs = [0, 1];
}
