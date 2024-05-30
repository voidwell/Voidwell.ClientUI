import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { PlatformType } from '../../models/platform-type.model';
import { PlatformOption, PlatformOptions } from '../../models/platform-options.model';

@Component({
    selector: 'vw-ps2-platform-control',
    templateUrl: './platform-control.template.html',
    styleUrls: ['./platform-control.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformControlComponent implements OnChanges {
    @Input() platform!: PlatformType;
    @Output() platformChanged = new EventEmitter<PlatformType>();

    platformOptions = PlatformOptions;
    selectedValue!: PlatformOption;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['platform']) {
            this.selectedValue = this.platformOptions.find(a => a.type === this.platform)!;
        }
    }

    onValueChange(event: MatSelectChange) {
        const value = event.value as PlatformOption;
        this.platformChanged.emit(value.type);
    }
}
