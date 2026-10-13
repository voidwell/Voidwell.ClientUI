import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { of } from 'rxjs';
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
                { provide: CustomEventRepository, useValue: {} },
                { provide: WorldRepository, useValue: { getWorlds: () => of([{ id: 17, name: 'Emerald' }, { id: 1, name: 'Connery' }]) } }
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

    it('lists the worlds served by the API as servers, sorted by name', () => {
        const fixture = TestBed.createComponent(EventEditorDialog);

        expect(fixture.componentInstance.servers()).toEqual([
            { id: '1', name: 'Connery' },
            { id: '17', name: 'Emerald' }
        ]);
    });
});
