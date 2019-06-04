import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'factionColor'})

export class FactionColorPipe implements PipeTransform {
    factions = {
        0: 'faction-ns-text',
        1: 'faction-vs-text',
        2: 'faction-nc-text',
        3: 'faction-tr-text',
        4: 'faction-ns-text'
    };

    transform(factionId: any): string {
        return this.factions[factionId];
    }
}