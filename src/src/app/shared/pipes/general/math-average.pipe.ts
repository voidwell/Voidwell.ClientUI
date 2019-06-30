import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'avg' })
export class AvgPipe implements PipeTransform {
    transform(arr: number[]): number | number[] {
        if (!Array.isArray(arr)) {
            return arr;
        }

        let total = arr.reduce((sum, curr) => sum + curr, 0);

        return total / arr.length;
    }
}