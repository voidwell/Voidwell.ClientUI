import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, forwardRef, ViewEncapsulation, Inject, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Secret } from '../models/secret.model';
import { Observable } from 'rxjs';

let nextUniqueId = 0;

const SECRET_MANAGER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SecretManagerComponent),
    multi: true
};

export class SecretListChange {
    constructor(
      public source: SecretManagerComponent,
      public value: Secret[]) { }
}

@Component({
    selector: 'vw-secret-manager',
    templateUrl: './secret-manager.template.html',
    styleUrls: ['./secret-manager.styles.css'],
    host: {
        'class': 'vw-secret-manager',
        '[id]': 'id'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SECRET_MANAGER_VALUE_ACCESSOR]
})

export class SecretManagerComponent implements ControlValueAccessor {
    private _onChange = (_: any) => {};

    private _uniqueId: string = `secret-manager-${++nextUniqueId}`;
    private _valueList: Secret[] = [];
    private _isDeletingSecret: boolean = false;

    @Input() id: string = this._uniqueId;
    @Input() onGenerate: (request: NewSecretRequestData) => Observable<any>;
    @Input() onDelete: (value: Secret, index: number) => Observable<any>;

    @Input()
    get value(): Secret[] { return this._valueList; }
    set value(value: Secret[]) {
        this._valueList = value;
        this._changeDetectorRef.markForCheck();
    }

    @Output() readonly change: EventEmitter<SecretListChange> = new EventEmitter<SecretListChange>();
    @Output() readonly reload: EventEmitter<any> = new EventEmitter<any>();

    get inputId(): string { return `${this.id || this._uniqueId}-input`; }

    constructor(private _changeDetectorRef: ChangeDetectorRef, public dialog: MatDialog) {
    }

    _onGenerateClick(event: Event) {
        event.stopPropagation();
    
        this.dialog.open(SecretManagerNewSecretDialog, {})
            .afterClosed().subscribe((result: NewSecretRequestData) => {
                if(!result) {
                    return;
                }
                this.onGenerate(result)
                    .subscribe(secret => {
                        this.dialog.open(SecretManagerShowSecretDialog, {
                            data: { secret: secret }
                        }).afterClosed().subscribe(() => {
                            this.reload.emit();
                        });
                    }); 
            });
    }

    _onDeleteClick(event: Event, secret: Secret) {
        if (this._isDeletingSecret) {
            return;
        }

        this._isDeletingSecret = true;
        event.stopPropagation();

        this.dialog.open(SecretManagerDeleteSecretDialog, {
                data: secret
            }).afterClosed().subscribe(confirmed => {
                if(!confirmed) {
                    return;
                }
                let idx = this.value.indexOf(secret);
                this.onDelete(secret, idx)
                    .subscribe(() => {
                        this._isDeletingSecret = false;
                        this.value.splice(idx, 1);
                        this._emitChangeEvent();
                        this._changeDetectorRef.markForCheck();
                    }); 
            });
    }

    private _emitChangeEvent() {
        this._onChange(this.value);
        this.change.emit(new SecretListChange(this, this.value));
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
    }
}

export class NewSecretRequestData {
    description: string;
    expiration: string;
}

@Component({
    selector: 'secret-manager-new-secret-dialog',
    templateUrl: 'secret-manager-new-secret-dialog.html',
})
export class SecretManagerNewSecretDialog {
    data: NewSecretRequestData = new NewSecretRequestData();

    constructor(
        public dialogRef: MatDialogRef<SecretManagerNewSecretDialog>) {}
}

@Component({
    selector: 'secret-manager-show-secret-dialog',
    templateUrl: 'secret-manager-show-secret-dialog.html',
})
export class SecretManagerShowSecretDialog {
    constructor(
        public dialogRef: MatDialogRef<SecretManagerShowSecretDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}
}

@Component({
    selector: 'secret-manager-delete-secret-dialog',
    templateUrl: 'secret-manager-delete-secret-dialog.html',
})
export class SecretManagerDeleteSecretDialog {
    constructor(
        public dialogRef: MatDialogRef<SecretManagerDeleteSecretDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}
}