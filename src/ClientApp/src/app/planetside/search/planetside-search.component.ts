import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from './../../shared/services/search.service';

@Component({
    templateUrl: './planetside-search.template.html',
    styleUrls: ['./planetside-search.styles.css']
})

export class PlanetsideSearchComponent implements OnDestroy {
    @ViewChild('searchInput') searchInput: ElementRef;

    private openSub: Subscription;

    constructor(public searchService: SearchService) {
        this.searchService.onSearchOpen.subscribe(event => {
            console.log(this.searchInput);
            this.searchInput.nativeElement.focus();
        });
    }

    ngOnDestroy() {
        if (this.openSub) this.openSub.unsubscribe();
    }
}