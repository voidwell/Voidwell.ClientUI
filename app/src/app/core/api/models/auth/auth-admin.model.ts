/** A user row of `GET authadmin/users` */
export interface SimpleUser {
    id: string;
    userName: string;
    lastLoginDate?: string;
}

/** `GET authadmin/user/{userId}` */
export interface UserDetails {
    id: string;
    userName: string;
    email: string;
    timeZone?: string;
    createdDate?: string;
    lastLoginDate?: string;
    passwordSetDate?: string;
    lockoutEndDate?: string;
    roles: string[];
}

/** A role row of `GET authadmin/roles` */
export interface SimpleRole {
    id: string;
    name: string;
}

/** Body of `PUT authadmin/user/{userId}/roles` */
export interface UserRolesRequest {
    roles: string[];
}

/** Body of `POST authadmin/user/{userId}/lock` */
export interface UserLockRequest {
    isPermanant?: boolean;
    lockLength?: number;
}

/** Body of `POST authadmin/role` */
export interface RoleRequest {
    name: string;
}
