import { ChangeDetectorRef, Component, OnInit, inject, input, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { SimpleCharacterDetails } from '@core/api/models/ps2/character.model';
import { getErrorMessage } from '@core/util/error-message';
import { definedParams } from '@shared/utils/query-params';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { cellOf, sortRows } from '../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { BulkRow, MAX_NAMES, addNames, bulkRows, missingNames, toCsv } from './bulk-character-stats-figures';

@Component({
    templateUrl: './bulk-character-stats.component.html',
    styleUrls: ['./bulk-character-stats.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatFormField, MatLabel, MatChipGrid, MatChipRow, MatIcon, MatChipRemove, MatChipInput, MatButton, LoaderComponent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})

export class BulkCharacterStatsComponent implements OnInit {
    readonly names = input<string>();
    private router = inject(Router);
    private characterRepository = inject(CharacterRepository);
    private cdr = inject(ChangeDetectorRef);

    isLoading: boolean;
    errorMessage: string = null;

    readonly maxNames = MAX_NAMES;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    characterNames: string[] = [];

    /** What the API returned, for the CSV, and the names it had no character for. */
    private stats: SimpleCharacterDetails[] = [];
    readonly missing = signal<string[]>([]);
    readonly looked = signal(false);
    readonly rows = signal<BulkRow[]>([]);
    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly sortedRows = computed(() => sortRows(this.rows(), this.sort(), cellOf));
    readonly expanded = signal<ReadonlySet<string>>(new Set());

    ngOnInit() {
        const queryNames = definedParams({ names: this.names() })['names'];
        if (queryNames) {
            this.characterNames = addNames([], queryNames);
            this.onSubmit();
        }
    }

    add(event: MatChipInputEvent): void {
        this.characterNames = addNames(this.characterNames, event.value);
        this.setQueryParam('names', this.characterNames);

        if (event.input) {
            event.input.value = '';
        }
    }

    remove(characterName: string): void {
        const index = this.characterNames.indexOf(characterName);

        if (index >= 0) {
            this.characterNames = this.characterNames.filter(name => name !== characterName);
            this.setQueryParam('names', this.characterNames);
        }
    }

    onSubmit() {
        this.errorMessage = null;
        this.isLoading = true;
        const requested = this.characterNames.slice();

        this.characterRepository.getCharactersByName(requested)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }))
            .subscribe(data => {
                this.stats = data;
                this.rows.set(bulkRows(data));
                this.missing.set(missingNames(requested, data));
                this.expanded.set(new Set());
                this.looked.set(true);
                this.cdr.markForCheck();
            });
    }

    onSort(sort: Sort) {
        this.sort.set(sort);
    }

    toggle(id: string): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }

    onExport() {
        const blob = new Blob([toCsv(this.stats)], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'characters.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    private setQueryParam(key: string, value: string[]) {
        this.router.navigate([], { queryParams: { [key]: value.length ? value.join(',') : null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
}
