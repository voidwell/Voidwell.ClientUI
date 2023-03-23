import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'directive-tree',
    templateUrl: './directive-tree.template.html',
    styleUrls: ['./directive-tree.styles.css'],
    host: {'class': 'directive-tree'}
})

export class DirectiveTreeComponent implements OnInit {
    @Input() tree: any;

    private tabIndex: number;

    ngOnInit() {
        if (this.tree.currentDirectiveTierId > 0) {
            this.tabIndex = this.tree.currentDirectiveTierId - 1;
        }
    }
}