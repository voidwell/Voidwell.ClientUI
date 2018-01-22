import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';
import { VoidwellApi } from '../shared/services/voidwell-api.service';

@Component({
    selector: 'voidwell-admin-users',
    templateUrl: './users.template.html',
    styleUrls: ['users.styles.css'],
    providers: [VoidwellApi]
})

export class UsersComponent implements OnInit, OnDestroy {
    users: Array<any>;
    roles: Array<any>;
    errorMessage: string = null;
    isLoading: boolean = false;
    isLoadingUsers: boolean = false;
    isLoadingRoles: boolean = false;
    getUsersRequest: Subscription;
    getRolesRequest: Subscription;

    constructor(private api: VoidwellApi) {
        
    }

    ngOnInit() {
        this.isLoadingUsers = true;
        this.getUsersRequest = this.api.getUsers()
            .subscribe(users => {
                this.users = users.sort(this.usersSort);
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
    }

    getDetails(user: any) {
        this.errorMessage = null;
        user.isLoading = true;
        this.api.getUser(user.id).subscribe(userDetails => {
            user.isLoading = false;
            Object.assign(user, userDetails);
        });;
    }

    deleteUser(user: any) {
        this.errorMessage = null;
        user.isLocked = true;
        this.api.deleteUser(user.id).subscribe(users => {
            user.isLocked = false;
            let idx = this.users.indexOf(user);
            this.users.splice(idx, 1);
        });;
    }

    disableUser(user: any) {
        this.errorMessage = null;
        user.isLocked = true;

        user.isLocked = false;
    }

    resetPassword(user: any) {
        this.errorMessage = null;
        user.isLocked = true;

        user.isLocked = false;
    }

    private setRoles(user, userRolesForm: NgForm) {
        if (userRolesForm.pristine) {
            return;
        }

        this.errorMessage = null;
        user.isLocked = true;
        this.api.updateUserRoles(user.id, userRolesForm.value)
            .catch(error => {
                this.errorMessage = error._body;
                userRolesForm.form.patchValue(user);
                return Observable.throw(error);
            })
            .finally(() => {
                user.isLocked = false;
                userRolesForm.form.markAsPristine();
            })
            .subscribe(updatedRoles => {
                user.roles = updatedRoles;
            });
    }

    private updateLoading() {
        this.isLoading = this.isLoadingRoles || this.isLoadingUsers;
    }

    private usersSort(a, b) {
        if (a.userName > b.userName)
            return true;

        return false;
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