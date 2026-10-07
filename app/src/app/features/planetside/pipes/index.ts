import { DgcImageUrlPipe } from './dgc-image-url.pipe';
import { FactionColorPipe } from './faction-color.pipe';
import { FactionNamePipe } from './faction-name.pipe';
import { FactionCodePipe } from './faction-code.pipe';
import { ZoneNamePipe } from './zone-name.pipe';
import { WorldNamePipe } from './world-name.pipe';
import { FactionBackgroundPipe } from './faction-background.pipe';

const PIPES = [
    DgcImageUrlPipe, FactionColorPipe, FactionNamePipe, FactionCodePipe, ZoneNamePipe, WorldNamePipe, FactionBackgroundPipe
];

/** The planetside pipes, provided at the route so components can also inject them. */
export const PLANETSIDE_PIPES = PIPES;

export { DgcImageUrlPipe } from './dgc-image-url.pipe';
export { FactionColorPipe } from './faction-color.pipe';
export { FactionNamePipe } from './faction-name.pipe';
export { FactionCodePipe } from './faction-code.pipe';
export { ZoneNamePipe } from './zone-name.pipe';
export { WorldNamePipe } from './world-name.pipe';
export { FactionBackgroundPipe } from './faction-background.pipe';