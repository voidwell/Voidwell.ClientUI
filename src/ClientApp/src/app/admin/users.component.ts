import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'voidwell-admin-users',
    templateUrl: './users.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class UsersComponent implements OnInit, OnDestroy {
    users: Array<any>;
    roles: Array<any>;
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
                this.users = users;
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
        user.isLoading = true;
        this.api.getUser(user.id).subscribe(userDetails => {
            user.isLoading = false;
            Object.assign(user, userDetails);
        });;
    }

    private updateLoading() {
        this.isLoading = this.isLoadingRoles || this.isLoadingUsers;
    }

    deleteUser(user: any) {
        this.isLoading = true;
        this.api.deleteUser(user.id).subscribe(users => {
            this.isLoading = false;
            let idx = this.users.indexOf(user);
            this.users.splice(idx, 1);
        });;
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