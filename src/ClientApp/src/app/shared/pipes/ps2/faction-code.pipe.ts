import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'factionCode' })

export class FactionCodePipe implements PipeTransform {
    factions = {
        1: 'VS',
        2: 'NC',
        3: 'TR'
    };

    transform(factionId: any): string {
        return this.factions[factionId];
    }
}