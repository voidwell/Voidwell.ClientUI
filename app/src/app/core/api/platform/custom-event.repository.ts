import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { PLATFORM_API_URL } from '../api-routes';
import { CustomEvent, CustomEventDetails } from '../models/platform/custom-event.model';

/** Voidwell.Platform `CustomEventController` (`platform/gameevent`). */
@Injectable({ providedIn: 'root' })
export class CustomEventRepository {
    private api = inject(ApiClient);
    private readonly url = `${PLATFORM_API_URL}/gameevent`;

    getEvents(): Observable<CustomEvent[]> {
        return this.api.get<CustomEvent[]>(this.url);
    }

    getEventsByGame(gameId: string): Observable<CustomEvent[]> {
        return this.api.get<CustomEvent[]>(`${this.url}/game/${gameId}`);
    }

    /** Includes the combat report and territory score of the event. */
    getEvent(eventId: number | string): Observable<CustomEventDetails> {
        return this.api.get<CustomEventDetails>(`${this.url}/${eventId}`);
    }

    /** Requires the Events role. */
    createEvent(event: CustomEvent): Observable<CustomEvent> {
        return this.api.post<CustomEvent, CustomEvent>(this.url, event, { auth: true });
    }

    /** Requires the Events role. */
    updateEvent(eventId: number | string, event: CustomEvent): Observable<CustomEvent> {
        return this.api.put<CustomEvent, CustomEvent>(`${this.url}/${eventId}`, event, { auth: true });
    }

    /** Administrator only. */
    deleteEvent(eventId: number | string): Observable<void> {
        return this.api.delete(`${this.url}/${eventId}`, { auth: true });
    }
}
