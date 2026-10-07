import { Pipe, PipeTransform, inject } from '@angular/core';
import { WorldService } from '../data/world.service';

@Pipe({
    name: 'worldName', pure: false
})

export class WorldNamePipe implements PipeTransform {
    private worldService = inject(WorldService);

    transform(worldId: number | string): string | null {
        if (!worldId) {
            return null;
        }

        const id = worldId.toString();
        return this.worldService.worlds()?.find(world => world.id.toString() === id)?.name ?? null;
    }
}
