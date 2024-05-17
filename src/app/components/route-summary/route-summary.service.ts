import { Injectable } from '@angular/core';
import { Polyline } from 'leaflet';
import { BehaviorSubject } from 'rxjs';
import { MapService } from 'src/app/_services/map.service';

@Injectable({
  providedIn: 'root'
})
export class RouteSummaryService {
  private _routeRef$ = new BehaviorSubject<{ polyline: Polyline | undefined, polylineDecorator: any } | null>(null)
  private _passedDistancePolyline$ = new BehaviorSubject<Polyline | null>(null)
  measuring$ = new BehaviorSubject<TMeasuring | null>(null)
  // constructor(private mapService: MapService) { }

  setNavigationData({ routeRef, passedDistancePolyline }: TNavigationData ) {
    this._routeRef$.next(routeRef)
    this._passedDistancePolyline$.next(passedDistancePolyline)
  }

  closeSummary() {
    this._routeRef$.value?.polyline?.remove()
    this._routeRef$.value?.polylineDecorator?.remove()
    this._passedDistancePolyline$.value?.remove()
  }

}

export type TMeasuring = { elapsedTime: number | undefined, traveledDistance: number | undefined, averageSpeed: string | undefined }

type TNavigationData = { routeRef: { polyline: Polyline | undefined, polylineDecorator: any } | null, passedDistancePolyline: Polyline | null }
