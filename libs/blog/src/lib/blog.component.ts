import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getBlogPosts, getLoadStatus } from './+state/selector';
import { map } from 'rxjs';
import { LoadStatus } from '@voidwell/common/utils';

@Component({
  selector: 'vw-blog',
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogComponent {
  blogPosts$ = this.store.select(getBlogPosts);
  isLoading$ = this.store.select(getLoadStatus).pipe(map(loadStatus => loadStatus === LoadStatus.Loading));

  constructor(public store: Store) {}
}
