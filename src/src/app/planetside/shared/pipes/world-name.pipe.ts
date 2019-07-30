import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { WorldService } from './../services/world-service.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'worldName', pure: false })

export class WorldNamePipe implements PipeTransform, OnDestroy {
    private worlds;
    private worldSub: Subscription;

    constructor(private worldService: WorldService) {
        this.worldSub = this.worldService.Worlds.subscribe(worlds => this.worlds = worlds);
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

    ngOnDestroy(): void {
        if (this.worldSub) this.worldSub.unsubscribe();
    }
}