import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'factionName'})

export class FactionNamePipe implements PipeTransform {
    factions: { [id: string]: string } = {
        1: 'Vanu Sovereignty',
        2: 'New Conglomerate',
        3: 'Terran Republic',
        4: 'NS Operatives'
    };

    transform(factionId: string): string {
        return this.factions[factionId];
    }
}