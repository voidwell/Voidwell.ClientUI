import { Component, input } from '@angular/core';

/** A red ring with a filled centre and an arc that spins around it: an alert is running. */
@Component({
    selector: 'vw-alert-indicator',
    template: `
        <svg viewBox="0 0 16 16" role="img" [attr.aria-label]="label()">
            <title>{{ label() }}</title>
            <circle class="ring" cx="8" cy="8" r="6" />
            <circle class="core" cx="8" cy="8" r="3.5" />
            <path class="arc" d="M8 2a6 6 0 0 1 6 6" />
        </svg>`,
    styleUrls: ['./alert-indicator.component.css']
})
export class AlertIndicatorComponent {
    readonly label = input('Alert in progress');
}
