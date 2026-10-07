import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, throwError } from 'rxjs';
import { distinctUntilChanged, debounceTime, catchError, tap } from 'rxjs/operators';
import { ClientConfig } from '@core/api/models/auth/oidc-client.model';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { ClientsTableDataSource } from './clients.data-source';
import { DialogData, ClientsListNewDialog } from './clients-list-new-dialog/clients-list-new-dialog.component';

@Component({
    templateUrl: './clients-list.component.html',
    styleUrls: ['./clients-list.component.css'],
    imports: [LoaderComponent, MatButton, MatFormField, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIcon, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, AsyncPipe]
})

export class ClientsListComponent implements OnInit, AfterViewInit {
    private oidcAdminRepository = inject(OidcAdminRepository);
    dialog = inject(MatDialog);
    private router = inject(Router);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    dataSource: ClientsTableDataSource;

    ngOnInit() {
        this.dataSource = new ClientsTableDataSource(this.oidcAdminRepository);

        this.dataSource.loadClients('', 1);
    }

    ngAfterViewInit() {
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(1000))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.paginator.pageIndex = 0;
                this.loadClientList();
            });

        this.paginator.page
            .pipe(
                tap(() => this.loadClientList())
            )
            .subscribe();
    }

    private loadClientList() {
        if (!this.dataSource) { return; }
        this.dataSource.loadClients(this.filter.nativeElement.value, this.paginator.pageIndex + 1);
    }

    createNewClient() {
        const dialogRef = this.dialog.open(ClientsListNewDialog, {});
    
        dialogRef.afterClosed().subscribe((result: DialogData) => {
            this.oidcAdminRepository.createClient(new ClientConfig(result))
                .pipe(catchError(error => {
                    return throwError(() => error);
                }))
                .subscribe(client => {
                    this.router.navigateByUrl(`admin/oidc/clients/${client.clientId}`);
                }); 
        });
    }
}

