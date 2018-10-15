import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'worldName'})

export class WorldNamePipe implements PipeTransform {
    worlds = {
        1: 'Connery',
        10: 'Miller',
        13: 'Cobalt',
        17: 'Emerald',
        19: 'Jaeger',
        25: 'Briggs',
        40: 'SolTech'
    };

    transform(worldId: any): string {
        let id = worldId.toString();
        return this.worlds[id];
    }
}