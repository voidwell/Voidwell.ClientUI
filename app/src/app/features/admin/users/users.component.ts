import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SimpleRole, SimpleUser } from '@core/api/models/auth/auth-admin.model';
import { AuthAdminRepository } from '@core/api/auth/auth-admin.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { UsersTableDataSource } from './users.data-source';
import { UserEditorDialog } from './user-editor-dialog/user-editor-dialog.component';

@Component({
    selector: 'voidwell-admin-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatFormField, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DatePipe]
})

export class UsersComponent implements OnInit, OnDestroy {
    private authAdminRepository = inject(AuthAdminRepository);
    private dialog = inject(MatDialog);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    users: SimpleUser[] = [];
    roles: SimpleRole[];
    errorMessage: string = null;
    isLoading: boolean = false;
    isLoadingUsers: boolean = false;
    isLoadingRoles: boolean = false;
    getUsersRequest: Subscription;
    getRolesRequest: Subscription;

    dataSource: UsersTableDataSource;

    ngOnInit() {
        this.isLoading = true;
        this.dataSource = new UsersTableDataSource(this.users, this.paginator);

        this.isLoadingUsers = true;
        this.getUsersRequest = this.authAdminRepository.getUsers()
            .subscribe(users => {
                this.users = users;
                this.dataSource = new UsersTableDataSource(this.users, this.paginator);
                this.isLoadingUsers = false;
                this.updateLoading();
            });

        this.isLoadingRoles = true;
        this.getRolesRequest = this.authAdminRepository.getRoles()
            .subscribe(roles => {
                this.roles = roles;
                this.isLoadingRoles = false;
                this.updateLoading();
            });

        this.updateLoading();

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    onEdit(user: SimpleUser) {
        const dialogRef = this.dialog.open(UserEditorDialog, {
            data: {
                userId: user.id,
                roles: this.roles
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            //Todo: save event after editing.
        });
    }

    private updateLoading() {
        this.isLoading = this.isLoadingRoles || this.isLoadingUsers;
    }

    ngOnDestroy() {
        if (this.getUsersRequest) {
            this.getUsersRequest.unsubscribe();
        }
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    }
}

