import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  standalone: true,
})
export class TimePipe implements PipeTransform {

  transform(sec: number | null | undefined, { showSeconds, hideZero, dots }: { showSeconds?: boolean, hideZero?: boolean, dots?: boolean } = { showSeconds: true, hideZero: true, dots: false }) {
    if (sec == null) return
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.round(sec % 60);

    let result = '';
    if (hours || !hideZero) {
      result += hours > 9 ? hours : '0' + hours + (dots ? ':' : 'h ');
    }
    if (minutes || !hideZero) {
      result += minutes > 9 ? minutes : '0' + minutes + (dots ? ':' : 'm ');
    }
    if (showSeconds && seconds || (hours === 0 && minutes === 0) || !hideZero) {
      result += seconds > 9 ? seconds : '0' + seconds + (dots ? '' : 's ');
    }

    return result.trim();
  }

}
