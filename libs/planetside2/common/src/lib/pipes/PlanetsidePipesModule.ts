import { NgModule } from '@angular/core';
import { MapRepository } from '../repositories/map.repository';
import { WorldService } from '../services/world-service.service';
import { ZoneService } from '../services/zone-service.service';
import { DgcImageUrlPipe } from './dgc-image-url.pipe';
import { FactionBackgroundPipe } from './faction-background.pipe';
import { FactionCodePipe } from './faction-code.pipe';
import { FactionColorPipe } from './faction-color.pipe';
import { FactionNamePipe } from './faction-name.pipe';
import { WorldNamePipe } from './world-name.pipe';
import { ZoneNamePipe } from './zone-name.pipe';

const PIPES = [
    DgcImageUrlPipe, FactionColorPipe, FactionNamePipe, FactionCodePipe, ZoneNamePipe, WorldNamePipe, FactionBackgroundPipe
];

@NgModule({
    declarations: PIPES,
    imports: [],
    providers: [...PIPES, MapRepository, WorldService, ZoneService],
    exports: PIPES
})
export class PlanetsidePipesModule {}
