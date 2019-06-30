import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'factionBackground' })

export class FactionBackgroundPipe implements PipeTransform {
    factions = {
        0: 'faction-ns-bg',
        1: 'faction-vs-bg',
        2: 'faction-nc-bg',
        3: 'faction-tr-bg',
        4: 'faction-ns-bg'
    };

    transform(factionId: any): string {
        return this.factions[factionId];
    }
}