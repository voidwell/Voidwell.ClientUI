import { Component, OnInit, ViewChild, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { getErrorMessage } from '@core/util/error-message';
import { definedParams } from '@shared/utils/query-params';
import { SimpleCharacterDetails } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { NgClass, DecimalPipe } from '@angular/common';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { BulkCharacterStatsDataSource } from './bulk-character-stats.data-source';

@Component({
    templateUrl: './bulk-character-stats.component.html',
    styleUrls: ['./bulk-character-stats.component.css'],
    imports: [MatCard, MatCardContent, MatFormField, MatChipGrid, MatChipRow, MatIcon, MatChipRemove, MatChipInput, MatButton, LoaderComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, RouterLink, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DecimalPipe, FactionColorPipe]
})

export class BulkCharacterStatsComponent implements OnInit {
  readonly names = input<string>();
  private router = inject(Router);
  private characterRepository = inject(CharacterRepository);

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading: boolean;
  errorMessage: string = null;

  characterNames: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  stats: SimpleCharacterDetails[] = [];
  dataSource: BulkCharacterStatsDataSource;

  queryParams: {
    [key: string]: string
  };

  constructor() {
  }

  ngOnInit() {
    this.queryParams = definedParams({ names: this.names() });

    if (this.queryParams['names']) {
      this.characterNames = this.queryParams['names'].split(',');
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    const values = value.split(",");

    for (let i = 0; i < values.length; i++) {
      const value = (values[i] || '').trim();
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

    this.characterRepository.getCharactersByName(this.characterNames)
      .pipe(catchError(error => {
        this.errorMessage = getErrorMessage(error)
        return throwError(() => error);
      }))
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(data => {
        this.stats = data;
        this.dataSource = new BulkCharacterStatsDataSource(this.stats, this.sort);
      });
  }

  onExport() {
    const rows: unknown[][] = [];
    const columns: string[] = [];

    for (let i = 0; i < this.stats.length; i++) {
      const cols = Object.keys(this.stats[i]);

      for (let c = 0; c < cols.length; c++) {
        if (columns.indexOf(cols[c]) === -1) {
          columns.push(cols[c]);
        }
      }
    }

    rows.push(columns);

    for (let i = 0; i < this.stats.length; i++) {
      const row: unknown[] = [];

      for (let c = 0; c < columns.length; c++) {
        row.push((this.stats[i] as unknown as Record<string, unknown>)[columns[c]]);
      }

      rows.push(row);
    }

    this.exportToCsv("characters.csv", rows);
  }

  private setQueryParam(key: string, value: string | string[]) {
      let sVal: string;

      if (value instanceof Array) {
          sVal = value.join(',');
      } else {
          sVal = value;
      }

      this.queryParams[key] = sVal;

      this.router.navigate([], { queryParams: this.queryParams, replaceUrl: true });
  }

  private exportToCsv(filename: string, rows: unknown[][]) {
      const processRow = function (row: unknown[]) {
          let finalVal = '';
          for (let j = 0; j < row.length; j++) {
              let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
              if (row[j] instanceof Date) {
                  innerValue = (row[j] as Date).toLocaleString();
              };
              let result = innerValue.replace(/"/g, '""');
              if (result.search(/("|,|\n)/g) >= 0)
                  result = '"' + result + '"';
              if (j > 0)
                  finalVal += ',';
              finalVal += result;
          }
          return finalVal + '\n';
      };

      let csvFile = '';
      for (let i = 0; i < rows.length; i++) {
          csvFile += processRow(rows[i]);
      }

      const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });

          const link = document.createElement("a");
          if (link.download !== undefined) { // feature detection
              // Browsers that support HTML5 download attribute
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", filename);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
    }
}

