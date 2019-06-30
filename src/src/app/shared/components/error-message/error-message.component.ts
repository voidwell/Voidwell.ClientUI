import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-error-message',
    templateUrl: './error-message.template.html',
    styleUrls: ['./error-message.styles.css']
})

export class ErrorMessageComponent {
    @Input() message: string;
}