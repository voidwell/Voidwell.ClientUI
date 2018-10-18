import { Pipe, PipeTransform } from '@angular/core';
import { WorldService } from './../services/world-service.service';

@Pipe({ name: 'worldName', pure: false })

export class WorldNamePipe implements PipeTransform {
    private worlds;

    constructor(private worldService: WorldService) {
        this.worldService.Worlds.subscribe(worlds => this.worlds = worlds);
    }

    transform(worldId: any): string {
        if (!worldId) {
            return null;
        }

        let id = worldId.toString();

        if (!this.worlds) {
            return null;
        }

        let world = this.worlds.filter(world => world.id.toString() === id);
        if (world.length > 0) {
            return world[0].name;
        }

        return null;
    }
}