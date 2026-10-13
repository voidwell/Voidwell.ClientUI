import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, BehaviorSubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogPost } from '@core/api/models/platform/post.model';

export class BlogTableDataSource extends DataSource<BlogPost> {
    private dataSubject: BehaviorSubject<BlogPost[]>;

    constructor(public data: BlogPost[], private paginator: MatPaginator) {
        super();

        this.dataSubject = new BehaviorSubject(this.data);
    }

    connect(): Observable<BlogPost[]> {
        return merge(this.dataSubject, this.paginator.page).pipe(map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return data.splice(startIndex, this.paginator.pageSize);
        }));
    }

    refresh() {
        this.dataSubject.next(this.data);
    }

    disconnect() { }
}
