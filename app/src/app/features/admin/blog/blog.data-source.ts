import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogPost } from '@core/api/models/platform/post.model';

export class BlogTableDataSource extends DataSource<BlogPost> {
    constructor(public data: BlogPost[], private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<BlogPost[]> {
        const first = of(this.data);
        return merge(first, this.paginator.page).pipe(map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return data.splice(startIndex, this.paginator.pageSize);
        }));
    }

    disconnect() { }
}
