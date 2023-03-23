import { Component, Input } from '@angular/core';

@Component({
    selector: 'directive-tree-list',
    templateUrl: './directive-tree-list.template.html',
    styleUrls: ['./directive-tree-list.styles.css'],
    host: {'class': 'directive-tree-list'}
})

export class DirectiveTreeListComponent {
    @Input() trees: any;

    private getHeaderTypeClass(tree) {
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

    private getRequirementBarCount(tree) {
        let currentTier = tree.tiers[tree.currentDirectiveTierId - 1];
        if (!currentTier) {
            return Array(0);
        }
        return Array(currentTier.completionCount).fill(1).map((x, i) => i);
    }

    private getRequirementBarsCompleted(tree) {
        let currentTier = tree.tiers[tree.currentDirectiveTierId - 1];
        if (!currentTier) {
            return 0; 
        }
        return currentTier.directives.filter(x => !!x.completionDate).length;
    }

    private getTreeDirectivePoints(tree) {
        return tree.tiers.filter(x => !!x.completionDate).reduce((s, x ) => s + x.directivePoints, 0);
    }
}