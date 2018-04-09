import { Component } from '@angular/core';

@Component({
    templateUrl: './planetside-world-map.template.html'
})

export class PlanetsideWorldMapComponent {
    navLinks = [
        { path: '2', display: 'Indar' },
        { path: '4', display: 'Hossin' },
        { path: '6', display: 'Amerish' },
        { path: '8', display: 'Esamir' }
    ];
}