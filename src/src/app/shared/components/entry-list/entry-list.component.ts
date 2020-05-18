import { Component, Input, ElementRef, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy, forwardRef, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@angular/material/core';

let nextUniqueId = 0;

const ENTRY_LIST_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EntryListComponent),
    multi: true
};

export class EntryListChange {
    constructor(
      public source: EntryListComponent,
      public value: string[]) { }
}

class EntryListBase {
}

const _EntryListMixinBase:
    CanDisableCtor &
    typeof EntryListBase = mixinDisabled(EntryListBase);

@Component({
    selector: 'vw-entry-list',
    templateUrl: './entry-list.template.html',
    styleUrls: ['./entry-list.styles.css'],
    host: {
        'class': 'vw-entry-list',
        '[id]': 'id',
        '[attr.mat-disabled]': 'disabled'
    },
    inputs: ['disabled', 'placeholder', 'emptyMessage'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ENTRY_LIST_VALUE_ACCESSOR]
})

export class EntryListComponent extends _EntryListMixinBase implements ControlValueAccessor, CanDisable {
    private _onChange = (_: any) => {};

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

    @Output() readonly change: EventEmitter<EntryListChange> =
      new EventEmitter<EntryListChange>();

    get inputId(): string { return `${this.id || this._uniqueId}-input`; }

    @ViewChild('input', { static: true }) _inputElement: ElementRef<HTMLInputElement>;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        super();
    }

    _onAddClick(event: Event) {
        event.stopPropagation();

        let value = this._inputElement.nativeElement.value = this._inputElement.nativeElement.value.trim();

        if (this._isValid(value)) {
            this.value.push(value);
            this._inputElement.nativeElement.value = '';

            this._emitChangeEvent();
        }

        this._inputElement.nativeElement.focus();
    }

    _onRemoveClick(event: Event, item: string) {
        event.stopPropagation();

        let idx = this.value.indexOf(item);

        this.value.splice(idx, 1);

        this._emitChangeEvent();
    }

    writeValue(value: any) {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
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
        this.change.emit(new EntryListChange(this, this.value));
    }

    private _isValid(value: string): boolean {
        return value !== '' && this.value.indexOf(value) === -1 && (this.validation ? this.validation(value) : true);
    }
}