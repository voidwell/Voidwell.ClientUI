import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'factionColor'})

export class FactionColorPipe implements PipeTransform {
    factions = {
        1: 'faction-vs-text',
        2: 'faction-nc-text',
        3: 'faction-tr-text'
    };

    transform(factionId: any): string {
        return this.factions[factionId];
    }
}