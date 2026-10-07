import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { AUTH_ADMIN_API_URL } from '../api-routes';
import { RoleRequest, SimpleRole, SimpleUser, UserDetails, UserLockRequest, UserRolesRequest } from '../models/auth/auth-admin.model';

/** `AuthAdminController` (`authadmin`). Administrator only. */
@Injectable({ providedIn: 'root' })
export class AuthAdminRepository {
    private api = inject(ApiClient);
    private readonly url = AUTH_ADMIN_API_URL;

    getUsers(): Observable<SimpleUser[]> {
        return this.api.get<SimpleUser[]>(`${this.url}/users`, { auth: true });
    }

    getUser(userId: string): Observable<UserDetails> {
        return this.api.get<UserDetails>(`${this.url}/user/${userId}`, { auth: true });
    }

    deleteUser(userId: string): Observable<void> {
        return this.api.delete(`${this.url}/user/${userId}`, { auth: true });
    }

    updateUserRoles(userId: string, request: UserRolesRequest): Observable<string[]> {
        return this.api.put<string[], UserRolesRequest>(`${this.url}/user/${userId}/roles`, request, { auth: true });
    }

    lockUser(userId: string, request: UserLockRequest): Observable<void> {
        return this.api.post<void, UserLockRequest>(`${this.url}/user/${userId}/lock`, request, { auth: true });
    }

    unlockUser(userId: string): Observable<void> {
        return this.api.post<void>(`${this.url}/user/${userId}/unlock`, null, { auth: true });
    }

    getRoles(): Observable<SimpleRole[]> {
        return this.api.get<SimpleRole[]>(`${this.url}/roles`, { auth: true });
    }

    createRole(request: RoleRequest): Observable<SimpleRole> {
        return this.api.post<SimpleRole, RoleRequest>(`${this.url}/role`, request, { auth: true });
    }

    deleteRole(roleId: string): Observable<void> {
        return this.api.delete(`${this.url}/role/${roleId}`, { auth: true });
    }
}
