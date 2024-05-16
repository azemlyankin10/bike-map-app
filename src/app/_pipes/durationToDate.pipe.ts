import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationToDate',
  standalone: true,
})
export class DurationToDatePipe implements PipeTransform {

  transform(sec: number | null | undefined, ...args: any[]) {
    if (sec == null) return
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.round(sec % 60);
    if (args[0] === 'formatTimeWithNames') {
      return `${hours}h ${minutes}m`;
    }
    return new Date(0, 0, 0, hours, minutes, seconds);
  }

}
