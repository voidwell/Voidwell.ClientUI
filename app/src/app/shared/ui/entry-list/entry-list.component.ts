import { Provider, Component, Input, ElementRef, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy, forwardRef, Output, EventEmitter, ViewEncapsulation, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';

let nextUniqueId = 0;

const ENTRY_LIST_VALUE_ACCESSOR: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EntryListComponent),
    multi: true
};

export class EntryListChange {
    constructor(
      public source: EntryListComponent,
      public value: string[]) { }
}


@Component({
    selector: 'vw-entry-list',
    templateUrl: './entry-list.component.html',
    styleUrls: ['./entry-list.component.css'],
    host: {
        'class': 'vw-entry-list',
        '[id]': 'id',
        '[attr.mat-disabled]': 'disabled'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ENTRY_LIST_VALUE_ACCESSOR],
    imports: [MatIcon, MatFormField, MatLabel, MatInput, MatIconButton]
})

export class EntryListComponent implements ControlValueAccessor {
    private _changeDetectorRef = inject(ChangeDetectorRef);

    @Input() disabled = false;

    private _onChange: (value: string[]) => void = () => {};

    private _uniqueId: string = `entry-list-${++nextUniqueId}`;
    private _valueList: string[] = [];

    @Input() id: string = this._uniqueId;
    @Input() placeholder: string;
    @Input() emptyMessage: string;
    @Input() validation: (value: string) => boolean;

    @Input()
    get value(): string[] { return this._valueList; }
    set value(value: string[]) {
        this._valueList = value;
        this._changeDetectorRef.markForCheck();
    }

    @Output() readonly entryListChange: EventEmitter<EntryListChange> =
      new EventEmitter<EntryListChange>();

    get inputId(): string { return `${this.id || this._uniqueId}-input`; }

    @ViewChild('input', { static: true }) _inputElement: ElementRef<HTMLInputElement>;

    _onAddClick(event: Event) {
        event.stopPropagation();

        const value = this._inputElement.nativeElement.value = this._inputElement.nativeElement.value.trim();

        if (this._isValid(value)) {
            this.value.push(value);
            this._inputElement.nativeElement.value = '';

            this._emitChangeEvent();
        }

        this._inputElement.nativeElement.focus();
    }

    _onRemoveClick(event: Event, item: string) {
        event.stopPropagation();

        const idx = this.value.indexOf(item);

        this.value.splice(idx, 1);

        this._emitChangeEvent();
    }

    writeValue(value: string[]) {
        this.value = value;
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this._changeDetectorRef.markForCheck();
    }

    addValue(value: string) {
        this.value.push(value);
        this._onChange(this.value);
    }

    private _emitChangeEvent() {
        this._onChange(this.value);
        this.entryListChange.emit(new EntryListChange(this, this.value));
    }

    private _isValid(value: string): boolean {
        return value !== '' && this.value.indexOf(value) === -1 && (this.validation ? this.validation(value) : true);
    }
}