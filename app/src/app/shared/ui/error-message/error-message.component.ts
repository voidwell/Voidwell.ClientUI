import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'vw-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.css'],
    imports: [MatIcon]
})

export class ErrorMessageComponent {
    @Input() message: string;
}