import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { AlertResult } from '@core/api/models/ps2/alert.model';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';
import { getErrorMessage } from '@core/util/error-message';

/** Anything with a combat report: a custom event or an alert. */
export type CombatEvent = CustomEventDetails | AlertResult;

/** What the pages of an alert or event share: the event they show, whether it is loading, and where they sit in the breadcrumbs. */
@Component({ template: '' })

export class PlanetsideCombatEventComponent<T extends CombatEvent = CombatEvent> {
    private destroyRef = inject(DestroyRef);
    private request: Subscription | null = null;

    /** The loaded event or alert; `null` while loading. */
    readonly event = signal<T | null>(null);
    readonly loading = signal(true);
    /** Why the event could not be loaded, if it could not. */
    readonly errorMessage = signal<string | null>(null);

    /** The page under the event that is showing, for the breadcrumbs; each page sets its own, and the overview clears it. */
    readonly section = signal<string | null>(null);

    get activeEvent(): T | null {
        return this.event();
    }

    /** Loads the event, dropping whatever was loading or loaded before. */
    protected load(source: Observable<T>): void {
        this.request?.unsubscribe();
        this.loading.set(true);
        this.errorMessage.set(null);
        this.event.set(null);

        this.request = source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: data => {
                this.event.set(data);
                this.loading.set(false);
            },
            error: error => {
                this.errorMessage.set(getErrorMessage(error) ?? 'Something went wrong.');
                this.loading.set(false);
            }
        });
    }
}
