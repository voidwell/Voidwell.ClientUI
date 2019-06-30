import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../shared/services/voidwell-api.service';

@Component({
    selector: 'voidwell-admin-roles',
    templateUrl: './roles.template.html',
    providers: [VoidwellApi]
})

export class RolesComponent implements OnInit, OnDestroy {
    isLoading: boolean;
    errorMessage: string = null;
    roles: Array<any>;
    getRolesRequest: Subscription;

    constructor(private api: VoidwellApi) {

    }

    ngOnInit() {
        this.isLoading = true;
        this.getRolesRequest = this.api.getAllRoles()
            .subscribe(roles => {
                this.roles = roles;
                this.isLoading = false;
            });
    }

    addRole(roleName: string) {
        this.errorMessage = null;
        this.isLoading = true;
        this.api.addRole(roleName)
            .pipe<any>(catchError(error => {
                try {
                    this.errorMessage = JSON.parse(error._body);
                }
                catch (ex) {
                    this.errorMessage = error._body;
                }
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(role => {
                this.roles.push(role);
            });
    }

    deleteRole(role: any) {
        this.errorMessage = null;
        this.isLoading = true;
        this.api.deleteRole(role.id)
            .pipe<any>(catchError(error => {
                try {
                    this.errorMessage = JSON.parse(error._body);
                }
                catch (ex) {
                    this.errorMessage = error._body;
                }
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(result => {
                let idx = this.roles.indexOf(role);
                this.roles.splice(idx, 1);
            });
    }

    getDetails(role: any) {
        /*
        role.isLoading = true;
        this.api.getUsersInRole(role.name).subscribe(users => {
            role.isLoading = false;
            role.users = users;
        });;
        */
    }

    ngOnDestroy() {
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    }
}