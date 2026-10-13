import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { EventEditorDialog } from './event-editor-dialog.component';

describe('EventEditorDialog date pickers', () => {
    const event: CustomEvent = {
        id: 1,
        name: 'Test event',
        startDate: '2024-03-05T18:30:00Z',
        endDate: '2024-03-05T20:30:00Z',
        isPrivate: false,
        teams: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideAnimationsAsync(),
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { event } },
                { provide: CustomEventRepository, useValue: {} }
            ]
        });
    });

    afterEach(() => {
        document.querySelectorAll('.cdk-overlay-container').forEach(e => e.remove());
    });

    it('shows the existing event dates in the inputs', async () => {
        const fixture = TestBed.createComponent(EventEditorDialog);
        fixture.detectChanges();
        await fixture.whenStable();

        const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input[placeholder$="date"]'));
        expect(inputs).toHaveLength(2);
        inputs.forEach(input => expect(input.value).toContain('2024'));
    });

    it('opens the calendar from the start date toggle', async () => {
        const fixture = TestBed.createComponent(EventEditorDialog);
        fixture.detectChanges();

        fixture.nativeElement.querySelector('mat-datetimepicker-toggle button').click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.querySelector('mat-datetimepicker-calendar')).not.toBeNull();
    });
});
