import { Injectable } from '@angular/core';
import { BehaviorSubject, auditTime, combineLatest, interval, map, of, switchMap, tap } from 'rxjs';
import { MapService } from './map.service';
import { LatLng, latLng } from 'leaflet'

@Injectable({
  providedIn: 'root',
})
export class MeasuringService {
  // elapsedTime = signal(0);
  constructor(private mapService: MapService) { }

  private _pauseClickedTime = 0;
  private _resumedTime = 0;
  private _pausedTime = 0;
  control(toDo: 'start' | 'pause' | 'stop' | 'resume') {
    switch (toDo) {
      case 'start':
        this._elapsedTime = 0;
        this.isPaused$.next(false);
        break;
      case 'pause':
        this._pauseClickedTime = Date.now();
        this.isPaused$.next(true);
        break;
      case 'resume':
        this._resumedTime = Date.now();
        this._pausedTime += this._resumedTime - this._pauseClickedTime;
        this.isPaused$.next(false);
        break;
      case 'stop':
        this._elapsedTime = 0;
        this.isPaused$.next(true);
        break;
    }
  }
  /**
   * Timer
   */
  private isPaused$ = new BehaviorSubject<boolean>(true);
  private _elapsedTime = 0;
  // seconds elapsed every 100ms
  elapsedTime$() {
    const startTime = Date.now();
    return this.isPaused$.pipe(
      switchMap(isPaused => isPaused ? of(this._elapsedTime) : interval(100).pipe(
        map(() => (Date.now() - this._pausedTime - startTime) / 1000),
        tap(time => this._elapsedTime = time),
      ))
    );
  }
  /**
   * Distance
   */
  private distanceToCalculate: [LatLng | null, LatLng | null] = [null, null];
  private _passedDistance = 0;
  // distance in meters
  traveledDistance$() {
    return this.isPaused$.pipe(
      switchMap(isPaused => {
        if (isPaused) {
          this.distanceToCalculate = [null, null]
          return of(this._passedDistance)
        }
        return this.mapService.userCurrentLocation$.pipe(
          map((location) => {
            if (!location) return this.distanceToCalculate;
            // console.log(location, 'location');

            const { lat, lon } = location;
            this.distanceToCalculate[0] = this.distanceToCalculate[1];
            this.distanceToCalculate[1] = latLng(lat, lon);
            return this.distanceToCalculate;
          }),
          map(([start, end]) => start && end ? start.distanceTo(end) : 0),
          tap(distance => this._passedDistanceBetweenTwoPoints$.next(distance)), // for speed calculation
          map(distance => this._passedDistance += distance)
        )
      })
    )
  }
  /**
   * Speed
   */
  private _passedDistanceBetweenTwoPoints$ = new BehaviorSubject<number>(0);
  private previousTime = 0;
  currentSpeed$() {
    let previousSpeed = 0;
    let previousDistance = 0;
    return combineLatest([this._passedDistanceBetweenTwoPoints$, this.elapsedTime$()]).pipe(
      map(([distance, time]) => {
        if (this.isPaused$.value) {
          this.previousTime = 0;
          previousSpeed = 0;
          previousDistance = 0;
          return '0 km/h'
        }
        // Calculate the time difference from the previous calculation
        const timeDifference = time - this.previousTime;
        // Calculate the speed in m/s only when distance changes
        let speed = previousSpeed;
        if (distance !== previousDistance) {
          speed = timeDifference > 0 ? distance / timeDifference : previousSpeed;
          previousSpeed = speed;
          this.previousTime = time;
          previousDistance = distance;
        }
        return (speed * 3.6).toFixed(0) + ' km/h';
      })
    );
  }
  /**
   * Average speed
   */
  averageSpeed$() {
    return combineLatest([this.traveledDistance$(), this.elapsedTime$()]).pipe(
      auditTime(5000),
      map(([distance, time]) => {
        // Calculate the average speed in m/s
        const averageSpeed = time > 0 ? distance / time : 0;

        // Convert to km/h and format the result
        return (averageSpeed * 3.6).toFixed(0) + ' km/h';
      })
    )
  }
}
