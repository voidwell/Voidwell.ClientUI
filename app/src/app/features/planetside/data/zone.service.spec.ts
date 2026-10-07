import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ZoneRepository } from '@core/api/ps2/zone.repository';
import { ZoneNamePipe } from '../pipes/zone-name.pipe';
import { ZoneService } from './zone.service';

const zones = [
    { id: 2, name: 'Indar' },
    { id: 10, name: 'Test Zone' },
    { id: 14, name: 'Instance' },
    { id: 95, name: 'Sanctuary' },
    { id: 344, name: 'Oshur' }
];

describe('ZoneService', () => {
    let service: ZoneService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ZoneService, ZoneNamePipe, { provide: ZoneRepository, useValue: { getZones: () => of(zones) } }]
        });
        service = TestBed.inject(ZoneService);
    });

    it('exposes the loaded zones and their ids', () => {
        expect(service.zones()).toEqual(zones);
        expect(service.zoneIds()).toEqual([2, 10, 14, 95, 344]);
    });

    it('builds tab links only for zones players can visit', () => {
        expect(service.zoneNavLinks()).toEqual([
            { path: '2', display: 'Indar' },
            { path: '344', display: 'Oshur' }
        ]);
    });

    it('looks zone names up by number or string id', () => {
        expect(service.zoneName(2)).toBe('Indar');
        expect(service.zoneName('344')).toBe('Oshur');
        expect(service.zoneName(999)).toBeUndefined();
    });

    it('drives the zoneName pipe', () => {
        const pipe = TestBed.inject(ZoneNamePipe);
        expect(pipe.transform(2)).toBe('Indar');
        expect(pipe.transform(0)).toBeNull();
        expect(pipe.transform(999)).toBeNull();
    });
});
