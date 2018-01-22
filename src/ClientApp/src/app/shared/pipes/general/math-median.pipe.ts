import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'median'})
export class MedianPipe implements PipeTransform {
    transform(arr: number[]): number|number[] {
        if (!Array.isArray(arr)) {
            return arr;
        }

        arr.sort(function (a, b) { return a - b; });

        let half = Math.floor(arr.length / 2);

        if (arr.length % 2) {
            return arr[half];
        }

        return (arr[half - 1] + arr[half]) / 2.0;
    }
}