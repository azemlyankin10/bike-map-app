import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  standalone: true,
})
export class TimePipe implements PipeTransform {

  transform(value: number, { showSeconds } = { showSeconds: true }) {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.round(value % 60);

    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0) {
      result += `${minutes}m `;
    }
    if (showSeconds && seconds > 0 || (hours === 0 && minutes === 0)) {
      result += `${seconds}s`;
    }

    return result.trim();
  }

}
