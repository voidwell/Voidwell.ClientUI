import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiResourceConfig } from '@core/api/models/auth/oidc-api-resource.model';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';

export class ApiResourcesTableDataSource extends DataSource<ApiResourceConfig> {
    private resourceSubject = new BehaviorSubject<ApiResourceConfig[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public totalItems: number;
    public pageSize: number;

    constructor(private oidcAdminRepository: OidcAdminRepository) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<ApiResourceConfig[]> {
        return this.resourceSubject.asObservable();
    }

    disconnect() {
        this.resourceSubject.complete();
        this.loadingSubject.complete();
    }

    loadResources(filter = '', pageIndex = 1) {
        this.loadingSubject.next(true);

        this.oidcAdminRepository.getApiResources(filter, pageIndex)
            .pipe(
                catchError(() => of({ data: [], totalCount: 0, pageSize: this.pageSize ?? 0 })),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(results => {
                this.totalItems = results.totalCount;
                this.pageSize = results.pageSize;
                this.resourceSubject.next(results.data)
            });
    }
}
