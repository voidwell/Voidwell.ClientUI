import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import {
    CharacterDetails,
    CharacterDirectivesOutline,
    CharacterWeaponDetails,
    OnlineCharacter,
    PlayerSession,
    PlayerSessionSummary,
    SimpleCharacterDetails
} from '../models/ps2/character.model';

/** Voidwell.DaybreakGames `CharacterController` (`ps2/character`). */
@Injectable({ providedIn: 'root' })
export class CharacterRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/character`;

    getCharacter(characterId: string): Observable<CharacterDetails> {
        return this.api.get<CharacterDetails>(`${this.url}/${characterId}`);
    }

    getSessions(characterId: string, page = 0): Observable<PlayerSessionSummary[]> {
        return this.api.get<PlayerSessionSummary[]>(`${this.url}/${characterId}/sessions`, { params: { page } });
    }

    getSession(characterId: string, sessionId: number | string): Observable<PlayerSession> {
        return this.api.get<PlayerSession>(`${this.url}/${characterId}/sessions/${sessionId}`);
    }

    getLiveSession(characterId: string): Observable<PlayerSession> {
        return this.api.get<PlayerSession>(`${this.url}/${characterId}/sessions/live`);
    }

    getOnlineState(characterId: string): Observable<OnlineCharacter> {
        return this.api.get<OnlineCharacter>(`${this.url}/${characterId}/state`);
    }

    getDirectives(characterId: string): Observable<CharacterDirectivesOutline> {
        return this.api.get<CharacterDirectivesOutline>(`${this.url}/${characterId}/directives`);
    }

    /** Requires the Mutterblack policy. */
    getCharacterByName(characterName: string): Observable<SimpleCharacterDetails> {
        return this.api.get<SimpleCharacterDetails>(`${this.url}/byname/${characterName}`, { auth: true });
    }

    /** Requires the Mutterblack policy. */
    getCharacterWeaponByName(characterName: string, weaponName: string): Observable<CharacterWeaponDetails> {
        return this.api.get<CharacterWeaponDetails>(`${this.url}/byname/${characterName}/weapon/${weaponName}`, { auth: true });
    }

    /** Looks up several characters at once; the API accepts at most 25 names. */
    getCharactersByName(characterNames: string[]): Observable<SimpleCharacterDetails[]> {
        return this.api.post<SimpleCharacterDetails[], string[]>(`${this.url}/byname`, characterNames);
    }
}
