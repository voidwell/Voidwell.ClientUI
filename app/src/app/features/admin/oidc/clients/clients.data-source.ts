import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClientConfig } from '@core/api/models/auth/oidc-client.model';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';

export class ClientsTableDataSource extends DataSource<ClientConfig> {
    private clientSubject = new BehaviorSubject<ClientConfig[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public totalItems: number;
    public pageSize: number;

    constructor(private oidcAdminRepository: OidcAdminRepository) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<ClientConfig[]> {
        return this.clientSubject.asObservable();
    }

    disconnect() {
        this.clientSubject.complete();
        this.loadingSubject.complete();
    }

    loadClients(filter = '', pageIndex = 1) {
        this.loadingSubject.next(true);

        this.oidcAdminRepository.getClients(filter, pageIndex)
            .pipe(
                catchError(() => of({ data: [], totalCount: 0, pageSize: this.pageSize ?? 0 })),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(results => {
                this.totalItems = results.totalCount;
                this.pageSize = results.pageSize;
                this.clientSubject.next(results.data)
            });
    }
}
