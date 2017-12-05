import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTabsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatIconModule
} from '@angular/material';

@NgModule({
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTabsModule,
        MatSelectModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatIconModule
    ],
    exports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTabsModule,
        MatSelectModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatIconModule
    ],
})
export class MaterialLib { }