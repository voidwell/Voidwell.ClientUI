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
    MatAutocompleteModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
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
        MatAutocompleteModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
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
        MatAutocompleteModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
})
export class MaterialLib { }