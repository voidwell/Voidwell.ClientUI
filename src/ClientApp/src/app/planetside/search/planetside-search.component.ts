import { Component } from '@angular/core';
import { SearchService } from './../../shared/services/search.service';

@Component({
    templateUrl: './planetside-search.template.html',
    styleUrls: ['./planetside-search.styles.css']
})

export class PlanetsideSearchComponent {
    constructor(public searchService: SearchService) {
    }
}