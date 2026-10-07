import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { OIDC_ADMIN_API_URL } from '../api-routes';
import { PagedResult, NewSecretRequest } from '../models/auth/oidc-admin.model';
import { ApiResourceConfig } from '../models/auth/oidc-api-resource.model';
import { ClientConfig } from '../models/auth/oidc-client.model';
import { Secret } from '../models/auth/oidc-secret.model';
import { SecretResponse } from '../models/auth/oidc-secret-response.model';

/** `OidcAdminController` (`oidcadmin`). Administrator only. */
@Injectable({ providedIn: 'root' })
export class OidcAdminRepository {
    private api = inject(ApiClient);
    private readonly url = OIDC_ADMIN_API_URL;

    getClients(search = '', page = 1): Observable<PagedResult<ClientConfig>> {
        return this.api.get<PagedResult<ClientConfig>>(`${this.url}/client`, { auth: true, params: { search, page } });
    }

    getClient(clientId: string): Observable<ClientConfig> {
        return this.api.get<ClientConfig>(`${this.url}/client/${clientId}`, { auth: true });
    }

    createClient(client: ClientConfig): Observable<ClientConfig> {
        return this.api.post<ClientConfig, ClientConfig>(`${this.url}/client`, client, { auth: true });
    }

    updateClient(clientId: string, client: ClientConfig): Observable<ClientConfig> {
        return this.api.put<ClientConfig, ClientConfig>(`${this.url}/client/${clientId}`, client, { auth: true });
    }

    deleteClient(clientId: string): Observable<void> {
        return this.api.delete(`${this.url}/client/${clientId}`, { auth: true });
    }

    getClientSecrets(clientId: string): Observable<Secret[]> {
        return this.api.get<Secret[]>(`${this.url}/client/${clientId}/secret`, { auth: true });
    }

    createClientSecret(clientId: string, request: NewSecretRequest): Observable<SecretResponse> {
        return this.api.post<SecretResponse, NewSecretRequest>(`${this.url}/client/${clientId}/secret`, request, { auth: true });
    }

    deleteClientSecret(clientId: string, secretId: string): Observable<void> {
        return this.api.delete(`${this.url}/client/${clientId}/secret/${secretId}`, { auth: true });
    }

    getApiResources(search = '', page = 1): Observable<PagedResult<ApiResourceConfig>> {
        return this.api.get<PagedResult<ApiResourceConfig>>(`${this.url}/resource`, { auth: true, params: { search, page } });
    }

    getApiResource(apiResourceId: string): Observable<ApiResourceConfig> {
        return this.api.get<ApiResourceConfig>(`${this.url}/resource/${apiResourceId}`, { auth: true });
    }

    createApiResource(resource: ApiResourceConfig): Observable<ApiResourceConfig> {
        return this.api.post<ApiResourceConfig, ApiResourceConfig>(`${this.url}/resource`, resource, { auth: true });
    }

    updateApiResource(apiResourceId: string, resource: ApiResourceConfig): Observable<ApiResourceConfig> {
        return this.api.put<ApiResourceConfig, ApiResourceConfig>(`${this.url}/resource/${apiResourceId}`, resource, { auth: true });
    }

    deleteApiResource(apiResourceId: string): Observable<void> {
        return this.api.delete(`${this.url}/resource/${apiResourceId}`, { auth: true });
    }

    getApiResourceSecrets(apiResourceId: string): Observable<Secret[]> {
        return this.api.get<Secret[]>(`${this.url}/resource/${apiResourceId}/secret`, { auth: true });
    }

    createApiResourceSecret(apiResourceId: string, request: NewSecretRequest): Observable<SecretResponse> {
        return this.api.post<SecretResponse, NewSecretRequest>(`${this.url}/resource/${apiResourceId}/secret`, request, { auth: true });
    }

    deleteApiResourceSecret(apiResourceId: string, secretId: string): Observable<void> {
        return this.api.delete(`${this.url}/resource/${apiResourceId}/secret/${secretId}`, { auth: true });
    }
}
