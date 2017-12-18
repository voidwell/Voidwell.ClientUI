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
    MatIconModule,
    MatAutocompleteModule
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
        MatIconModule,
        MatAutocompleteModule
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
        MatIconModule,
        MatAutocompleteModule
    ],
})
export class MaterialLib { }