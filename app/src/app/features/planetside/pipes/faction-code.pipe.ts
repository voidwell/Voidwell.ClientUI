import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'factionCode' })

export class FactionCodePipe implements PipeTransform {
    factions: Record<number, string> = {
        1: 'VS',
        2: 'NC',
        3: 'TR',
        4: 'NS'
    };

    transform(factionId: number | string): string {
        return this.factions[Number(factionId)];
    }
}