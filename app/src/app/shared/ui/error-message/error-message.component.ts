import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'vw-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.css'],
    imports: [MatIcon]
})

export class ErrorMessageComponent {
    @Input() message: string;
}