import { Component, Input } from '@angular/core';
import { CharacterDirectivesOutlineTree } from '@core/api/models/ps2/character.model';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent } from '@angular/material/expansion';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DirectiveTreeComponent } from '../directive-tree/directive-tree.component';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';

@Component({
    selector: 'directive-tree-list',
    templateUrl: './directive-tree-list.component.html',
    styleUrls: ['./directive-tree-list.component.css'],
    host: { 'class': 'directive-tree-list' },
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, NgClass, MatIcon, MatExpansionPanelContent, DirectiveTreeComponent, DgcImageUrlPipe]
})

export class DirectiveTreeListComponent {
    @Input() trees: CharacterDirectivesOutlineTree[];

    private getHeaderTypeClass(tree: CharacterDirectivesOutlineTree) {
        switch(tree.currentDirectiveTierId){
            case 0:
                return 'unstarted-tree';
            case 1:
                return 'started-tree';
            case 2:
                return 'novice-tree';
            case 3:
                return 'adept-tree';
            case 4:
                return 'expert-tree';
            case 5:
                return 'master-tree';
        }
    }

    private getRequirementBarCount(tree: CharacterDirectivesOutlineTree) {
        const currentTier = tree.tiers[tree.currentDirectiveTierId - 1];
        if (!currentTier) {
            return Array(0);
        }
        return Array(currentTier.completionCount).fill(1).map((x, i) => i);
    }

    private getRequirementBarsCompleted(tree: CharacterDirectivesOutlineTree) {
        const currentTier = tree.tiers[tree.currentDirectiveTierId - 1];
        if (!currentTier) {
            return 0; 
        }
        return currentTier.directives.filter(x => !!x.completionDate).length;
    }

    private getTreeDirectivePoints(tree: CharacterDirectivesOutlineTree) {
        return tree.tiers.filter(x => !!x.completionDate).reduce((s, x ) => s + x.directivePoints, 0);
    }
}