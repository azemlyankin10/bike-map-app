import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance',
  standalone: true,
})
export class DistancePipe implements PipeTransform {

  transform(value: number) {
    return `${(value / 1000).toFixed(1)} km`
  }

}
