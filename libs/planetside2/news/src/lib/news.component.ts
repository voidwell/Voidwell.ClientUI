import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getNewsPosts, getLoadStatus, getUpdatePosts } from './+state/selector';
import { map } from 'rxjs';
import { LoadStatus } from '@voidwell/common/utils';

@Component({
  selector: 'vw-ps2-news',
  templateUrl: './news.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent {
  newsPosts$ = this.store.select(getNewsPosts);
  updatePosts$ = this.store.select(getUpdatePosts);
  isLoading$ = this.store.select(getLoadStatus).pipe(map(loadStatus => loadStatus === LoadStatus.Loading));

  constructor(public store: Store) {}
}
