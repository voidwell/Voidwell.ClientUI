/** Paged list envelope returned by `GET oidcadmin/client` and `GET oidcadmin/resource`. */
export interface PagedResult<T> {
    data: T[];
    totalCount: number;
    pageSize: number;
}

/** Body of the secret creation endpoints. */
export interface NewSecretRequest {
    description: string;
    expiration?: string;
}
