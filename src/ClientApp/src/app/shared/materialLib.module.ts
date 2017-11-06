import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTabsModule
} from '@angular/material';

@NgModule({
    imports: [MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatCardModule, MatTabsModule],
    exports: [MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatCardModule, MatTabsModule],
})
export class MaterialLib { }