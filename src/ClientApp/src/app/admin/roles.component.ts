import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'voidwell-admin-roles',
    templateUrl: './roles.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class RolesComponent implements OnInit, OnDestroy {
    roles: Array<any>;
    isLoading: boolean = false;
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
        this.isLoading = true;
        this.api.addRole(roleName).subscribe(role => {
            this.isLoading = false;
            this.roles.push(role);
        });;
    }

    deleteRole(role: any) {
        this.isLoading = true;
        this.api.deleteRole(role.id).subscribe(result => {
            this.isLoading = false;
            let idx = this.roles.indexOf(role);
            this.roles.splice(idx, 1);
        });;
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