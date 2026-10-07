import { DataSource } from '@angular/cdk/collections';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { compareSortValues, SortValue } from '@shared/utils/sort';
import { SimpleCharacterDetails } from '@core/api/models/ps2/character.model';

export class BulkCharacterStatsDataSource extends DataSource<SimpleCharacterDetails> {
  constructor(private data: SimpleCharacterDetails[], private sort: MatSort) {
      super();
  }

  connect(): Observable<SimpleCharacterDetails[]> {
      const first = of(this.data);
      return merge(first, this.sort.sortChange).pipe(map(() => {
          return this.getSortedData();
      }));
  }

  getSortedData() {
      const data = this.data;
      if (!this.sort.active || this.sort.direction == '') { return data; }

      return data.sort((a, b) => {
          let f: (p: SimpleCharacterDetails) => SortValue;

          switch (this.sort.active) {
              case 'name': f = p => p.name; break;
              case 'world': f = p => p.world; break;
              case 'faction': f = p => p.factionId; break;
              case 'battlerank': f = p => p.battleRank; break;
              case 'playTime': f = p => p.totalPlayTimeMinutes; break;
              case 'kills': f = p => p.kills; break;
              case 'kdr': f = p => p.killDeathRatio; break;
              case 'hsr': f = p => p.headshotRatio; break;
              case 'kph': f = p => p.killsPerHour; break;
          }

          const propertyA: SortValue = f(a);
          const propertyB: SortValue = f(b);

          return compareSortValues(propertyA, propertyB, this.sort.direction);
      });
  }

  disconnect() { }
}
