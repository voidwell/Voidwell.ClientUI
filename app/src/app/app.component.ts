import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { VWFooterComponent } from '@core/layout/vw-footer/vw-footer.component';
import { VWHeaderComponent } from '@core/layout/vw-header/vw-header.component';
import { VWNavigationComponent } from '@core/layout/vw-navigation/vw-navigation.component';

@Component({
    selector: 'app',
    imports: [RouterOutlet, VWNavigationComponent, VWHeaderComponent, VWFooterComponent],
    templateUrl: './app.component.html',
})

export class AppComponent {
    private iconRegistry = inject(MatIconRegistry);

    constructor() {
        this.iconRegistry.setDefaultFontSetClass('mdi');
    }
}