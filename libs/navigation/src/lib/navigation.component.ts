import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { NavigationItemsService, NavigationMap } from '@voidwell/common/navigation';

@Component({
    selector: 'vw-navigation',
    templateUrl: './navigation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent {
  sideNavigationMap$: Observable<NavigationMap>;

  constructor(navigationItemsService: NavigationItemsService) {
    this.sideNavigationMap$ = navigationItemsService.getSideNavigationMap();
  }
}
