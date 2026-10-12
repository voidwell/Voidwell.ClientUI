import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore } from '@ngrx/store';
import { PS2_API_URL } from '../api-routes';
import { VoidwellAuthService } from '../../auth/voidwell-auth.service';
import { reducers } from '../../store/app.states';
import { Profile } from '../models/ps2/reference.model';
import { ProfileRepository } from './profile.repository';

describe('ProfileRepository', () => {
    let http: HttpTestingController;
    let repository: ProfileRepository;
    const url = `${PS2_API_URL}/profile`;
    const profiles: Profile[] = [{ id: 1, profileTypeId: 1, factionId: 1, name: 'Infiltrator', imageId: 0 }];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideStore(reducers),
                { provide: VoidwellAuthService, useValue: { checkSession: (): void => undefined } }
            ]
        });
        http = TestBed.inject(HttpTestingController);
        repository = TestBed.inject(ProfileRepository);
    });

    afterEach(() => http.verify());

    it('makes one request for subscribers that arrive before and after it completes', () => {
        const results: Profile[][] = [];
        repository.getProfiles().subscribe(r => results.push(r));
        repository.getProfiles().subscribe(r => results.push(r));

        http.expectOne(url).flush(profiles);

        repository.getProfiles().subscribe(r => results.push(r));

        expect(results).toEqual([profiles, profiles, profiles]);
    });

    it('requests again after a failure', () => {
        let failed = false;
        repository.getProfiles().subscribe({ error: () => (failed = true) });
        http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
        expect(failed).toBe(true);

        let result: Profile[] = [];
        repository.getProfiles().subscribe(r => (result = r));
        http.expectOne(url).flush(profiles);
        expect(result).toEqual(profiles);
    });
});
