import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getPlatformType, getSearchResults, getSearchStatus, getSearchType } from '../../+state/selector';
import { map } from 'rxjs';
import { LoadStatus } from '@voidwell/common/utils';
import { PlatformType } from '../../models/platform-type.model';
import { changePlatform, changeSearchType, updateSearchQuery } from '../../+state/actions';
import { SearchType } from '../../models/search-type.model';

@Component({
  selector: 'vw-ps2-header-bar',
  templateUrl: './header-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderBarComponent {
  constructor(public store: Store) {}

  platformType$ = this.store.select(getPlatformType);
  searchType$ = this.store.select(getSearchType);
  isSearching$ = this.store.select(getSearchStatus).pipe(map(status => status === LoadStatus.Loading));
  searchResults$ = this.store.select(getSearchResults);

  onPlatformChange(platformType: PlatformType) {
    this.store.dispatch(changePlatform({ platformType }));
  }

  onSearchTypeChange(searchType: SearchType) {
    this.store.dispatch(changeSearchType({ searchType }));
  }

  onSearchQueryChange(searchQuery: string) {
    this.store.dispatch(updateSearchQuery({ searchQuery }))
  }
}
