import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { Observable, throwError, of, merge } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSort } from '@angular/material/sort';
import { PlanetsideApi } from './../shared/services/planetside-api.service';

@Component({
  templateUrl: './bulk-character-stats.template.html',
  styleUrls: ['./bulk-character-stats.styles.css']
})

export class BulkCharacterStatsComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading: boolean;
  errorMessage: string = null;

  characterNames: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  stats: any[] = [];
  dataSource: TableDataSource;

  queryParams: {
    [key: string]: any
  };

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private api: PlanetsideApi) {
    this.queryParams = Object.assign({}, activatedRoute.snapshot.queryParams);
  }

  ngOnInit() {
    if (this.queryParams['names']) {
      this.characterNames = this.queryParams['names'].split(',');
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    const values = value.split(",");

    for (var i = 0; i < values.length; i++) {
      let value = (values[i] || '').trim();
      if (value) {
        this.characterNames.push(value);
      }
    }

    this.setQueryParam('names', this.characterNames);

    if (input) {
      input.value = '';
    }
  }

  remove(characterName: string): void {
    const index = this.characterNames.indexOf(characterName);

    if (index >= 0) {
      this.characterNames.splice(index, 1);
      this.setQueryParam('names', this.characterNames);
    }
  }

  onSubmit() {
    this.isLoading = true;

    this.api.getMultiplePlayerStatsByName(this.characterNames)
      .pipe<any>(catchError(error => {
        this.errorMessage = error._body || error.statusText
        return throwError(error);
      }))
      .pipe<any>(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(data => {
        this.stats = data;
        this.dataSource = new TableDataSource(this.stats, this.sort);
      });
  }

  onExport() {
    let rows = [];
    let columns = [];

    for (var i = 0; i < this.stats.length; i++) {
      let cols = Object.keys(this.stats[i]);

      for (var c = 0; c < cols.length; c++) {
        if (columns.indexOf(cols[c]) === -1) {
          columns.push(cols[c]);
        }
      }
    }

    rows.push(columns);

    for (var i = 0; i < this.stats.length; i++) {
      let row = [];

      for (var c = 0; c < columns.length; c++) {
        row.push(this.stats[i][columns[c]]);
      }

      rows.push(row);
    }

    this.exportToCsv("characters.csv", rows);
  }

  private setQueryParam(key: string, value: any) {
      let sVal: string;

      if (value instanceof Array) {
          sVal = value.join(',');
      } else {
          sVal = value;
      }

      this.queryParams[key] = sVal;

      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: this.queryParams, replaceUrl: true });
  }

  private exportToCsv(filename, rows) {
      var processRow = function (row) {
          var finalVal = '';
          for (var j = 0; j < row.length; j++) {
              var innerValue = row[j] === null ? '' : row[j].toString();
              if (row[j] instanceof Date) {
                  innerValue = row[j].toLocaleString();
              };
              var result = innerValue.replace(/"/g, '""');
              if (result.search(/("|,|\n)/g) >= 0)
                  result = '"' + result + '"';
              if (j > 0)
                  finalVal += ',';
              finalVal += result;
          }
          return finalVal + '\n';
      };

      var csvFile = '';
      for (var i = 0; i < rows.length; i++) {
          csvFile += processRow(rows[i]);
      }

      var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, filename);
      } else {
          var link = document.createElement("a");
          if (link.download !== undefined) { // feature detection
              // Browsers that support HTML5 download attribute
              var url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", filename);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
      }
    }
}

export class TableDataSource extends DataSource<any> {
  constructor(private data, private sort: MatSort) {
      super();
  }

  connect(): Observable<any[]> {
      let first = of(this.data);
      return merge(first, this.sort.sortChange).pipe(map(() => {
          return this.getSortedData();
      }));
  }

  getSortedData() {
      const data = this.data;
      if (!this.sort.active || this.sort.direction == '') { return data; }

      return data.sort((a, b) => {
          let f: (p: any) => any;

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
              case 'siege': f = p => p.siege; break;
              case 'ivi': f = p => p.ivi; break;
              case 'mostPlayedWeaponKills': f = p => p.mostPlayedWeaponKills; break;
              case 'playTimeInMax': f = p => p.playTimeInMax; break;
          }

          let propertyA: any;
          let propertyB: any;
          [propertyA, propertyB] = [f(a), f(b)];

          let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

          return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
      });
  }

  disconnect() { }
}