import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'factionName'})

export class FactionNamePipe implements PipeTransform {
    factions = {
        1: 'Vanu Sovereignty',
        2: 'New Conglomerate',
        3: 'Terran Republic'
    };

    transform(factionId: any): string {
        return this.factions[factionId];
    }
}