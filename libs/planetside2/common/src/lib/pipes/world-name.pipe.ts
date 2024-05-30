import { Pipe, PipeTransform } from '@angular/core';
import { World } from '../contracts/world.model';
import { WorldService } from '../services/world-service.service';

@Pipe({ name: 'worldName', pure: false })

export class WorldNamePipe implements PipeTransform {
    private worlds: World[] = [];

    constructor(private worldService: WorldService) {
        this.worldService.Worlds.subscribe(worlds => this.worlds = worlds);
    }

    transform(worldId: string | number): string | undefined {
        if (!worldId || !this.worlds) {
            return undefined;
        }

        return this.worlds.find(world => world.id.toString() === worldId.toString())?.name;
    }
}