import { NgModule } from '@angular/core';
import { AvgPipe } from './math-average.pipe';
import { MedianPipe } from './math-median.pipe';

const PIPES = [
    AvgPipe, MedianPipe
];

@NgModule({
    declarations: PIPES,
    imports: [],
    exports: PIPES
})
export class GeneralPipesModule {}

export { AvgPipe } from './math-average.pipe';
export { MedianPipe } from './math-median.pipe';