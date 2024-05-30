import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'vw-ps2-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubComponent {

  constructor(public store: Store) {}
}
