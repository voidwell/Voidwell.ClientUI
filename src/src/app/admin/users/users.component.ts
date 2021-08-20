import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, BehaviorSubject, Subscription, of, merge, fromEvent, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../shared/services/voidwell-api.service';

@Component({
    selector: 'voidwell-admin-users',
    templateUrl: './users.template.html',
    styleUrls: ['./users.styles.css']
})

export class UsersComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    users: Array<any> = [];
    roles: Array<any>;
    errorMessage: string = null;
    isLoading: boolean = false;
    isLoadingUsers: boolean = false;
    isLoadingRoles: boolean = false;
    getUsersRequest: Subscription;
    getRolesRequest: Subscription;

    dataSource: TableDataSource;

    constructor(private api: VoidwellApi, private dialog: MatDialog) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.dataSource = new TableDataSource(this.users, this.paginator);

        this.isLoadingUsers = true;
        this.getUsersRequest = this.api.getUsers()
            .subscribe(users => {
                this.users = users;
                this.dataSource = new TableDataSource(this.users, this.paginator);
                this.isLoadingUsers = false;
                this.updateLoading();
            });

        this.isLoadingRoles = true;
        this.getRolesRequest = this.api.getAllRoles()
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

    onEdit(user: any) {
        let dialogRef = this.dialog.open(UserEditorDialog, {
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

export class TableDataSource extends DataSource<any> {
    constructor(public data, private paginator: MatPaginator) {
        super();
    }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return merge(first, this.paginator.page, this._filterChange).pipe(map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            let filteredData = data.filter(item => {
                let searchStr = item.userName.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) != -1;
            });

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return filteredData.splice(startIndex, this.paginator.pageSize);
        }));
    }

    disconnect() { }
}

@Component({
    selector: 'user-editor-dialog',
    templateUrl: 'user-editor-dialog.html',
})
export class UserEditorDialog {
    public errorMessage: string;
    public isLoading: boolean;
    public isLocked: boolean;
    public user: any;

    constructor(public dialogRef: MatDialogRef<UserEditorDialog>, private api: VoidwellApi, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.isLoading = true;

        this.api.getUser(this.data.userId)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body;
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(user => {
                this.user = user;
            });
    }

    onRoleDropdownToggle(isOpen: boolean, userRolesForm: NgForm) {
        if (isOpen || userRolesForm.pristine) {
            return;
        }

        this.errorMessage = null;
        this.isLocked = true;
        
        this.api.updateUserRoles(this.user.id, userRolesForm.value)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body;
                userRolesForm.form.patchValue(this.user);
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLocked = false;
                userRolesForm.form.markAsPristine();
            }))
            .subscribe(updatedRoles => {
                this.user.roles = updatedRoles;
            });
    }

    lockUser() {
        this.errorMessage = null;
        this.isLocked = true;

        let params = {
            IsPermanant: true,
            LockLength: 60
        };

        this.api.lockUser(this.user.id, params)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body;
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLocked = false;
            }))
            .subscribe();
    }

    unlockUser() {
        this.errorMessage = null;
        this.isLocked = true;

        this.api.unlockUser(this.user.id)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body;
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLocked = false;
            }))
            .subscribe();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}