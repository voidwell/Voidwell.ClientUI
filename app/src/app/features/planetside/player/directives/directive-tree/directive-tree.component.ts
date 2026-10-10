import { Component, Input, OnInit } from '@angular/core';
import { CharacterDirectivesOutlineTree } from '@core/api/models/ps2/character.model';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { DirectiveTierComponent } from '../directive-tier/directive-tier.component';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';

@Component({
    selector: 'directive-tree',
    templateUrl: './directive-tree.component.html',
    styleUrls: ['./directive-tree.component.css'],
    host: { 'class': 'directive-tree' },
    imports: [MatTabGroup, MatTab, MatTabLabel, DirectiveTierComponent, SlicePipe, DecimalPipe, DgcImageUrlPipe]
})

export class DirectiveTreeComponent implements OnInit {
    @Input() tree: CharacterDirectivesOutlineTree;

    tabIndex: number;

    ngOnInit() {
        if (this.tree.currentDirectiveTierId > 0) {
            this.tabIndex = this.tree.currentDirectiveTierId - 1;
        }
    }
}