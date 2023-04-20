import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
    selector: 'app',
    templateUrl: './app.template.html',
    styleUrls: ['./app-import.styles.scss', './app.styles.css', './planetside.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class AppComponent {
    constructor(private iconRegistry: MatIconRegistry) {
        this.iconRegistry.setDefaultFontSetClass('mdi');
    }
}