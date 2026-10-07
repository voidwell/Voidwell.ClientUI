import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, throwError } from 'rxjs';
import { distinctUntilChanged, debounceTime, catchError, tap } from 'rxjs/operators';
import { ApiResourceConfig } from '@core/api/models/auth/oidc-api-resource.model';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { ApiResourcesTableDataSource } from './api-resources.data-source';
import { DialogData, ApiResourcesListNewDialog } from './api-resources-list-new-dialog/api-resources-list-new-dialog.component';

@Component({
    templateUrl: './api-resources-list.component.html',
    styleUrls: ['./api-resources-list.component.css'],
    imports: [LoaderComponent, MatButton, MatFormField, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIcon, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, AsyncPipe]
})

export class ApiResourcesListComponent implements OnInit, AfterViewInit {
    private oidcAdminRepository = inject(OidcAdminRepository);
    dialog = inject(MatDialog);
    private router = inject(Router);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    dataSource: ApiResourcesTableDataSource;

    ngOnInit() {
        this.dataSource = new ApiResourcesTableDataSource(this.oidcAdminRepository);

        this.dataSource.loadResources('', 1);
    }

    ngAfterViewInit() {
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(1000))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.paginator.pageIndex = 0;
                this.loadResourcesList();
            });

        this.paginator.page
            .pipe(
                tap(() => this.loadResourcesList())
            )
            .subscribe();
    }

    private loadResourcesList() {
        if (!this.dataSource) { return; }
        this.dataSource.loadResources(this.filter.nativeElement.value, this.paginator.pageIndex + 1);
    }

    createNewApiResource() {
        const dialogRef = this.dialog.open(ApiResourcesListNewDialog, {});
    
        dialogRef.afterClosed().subscribe((result: DialogData) => {
            this.oidcAdminRepository.createApiResource(new ApiResourceConfig(result))
                .pipe(catchError(error => {
                    return throwError(() => error);
                }))
                .subscribe(resource => {
                    this.router.navigateByUrl(`admin/oidc/resources/${resource.name}`);
                }); 
        });
    }
}

