import { Component } from '@angular/core';

@Component({
    templateUrl: './planetside-world-wrapper.template.html'
})

export class PlanetsideWorldWrapperComponent {
    private worlds: any[] = [
        { id: 1, name: 'Connery' },
        { id: 10, name: 'Miller' },
        { id: 13, name: 'Cobalt' },
        { id: 17, name: 'Emerald' },
        { id: 19, name: 'Jaeger' },
        { id: 25, name: 'Briggs' }
    ];
}