import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dgcImageUrl' })

export class DgcImageUrlPipe implements PipeTransform {
    transform(imageId: number | string): string {
        return 'https://census.daybreakgames.com/files/ps2/images/static/' + imageId + '.png';
    }
}