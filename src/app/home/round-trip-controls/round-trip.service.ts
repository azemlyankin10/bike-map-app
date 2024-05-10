import { Injectable, TemplateRef, signal } from '@angular/core';
import { BehaviorSubject, Subject, debounceTime, from, map, switchMap, tap } from 'rxjs';
import { GeoApiService, TDirectionApiOptions } from 'src/app/_services/api/geo.api.service';
import { Position, Geolocation } from '@capacitor/geolocation';
import { MapService } from 'src/app/_services/map.service';
import { Marker, Polyline, icon, marker } from 'leaflet';
import { getRandomNumber } from 'src/app/helpers/functions/getRandomNumber';

@Injectable({
  providedIn: 'root'
})
export class RoundTripService {
  constructor(private geoApi: GeoApiService, private mapService: MapService) {
    this.initGeneratingRoute()
    this.initInstructions()
  }
  /**
   * Shared components
   */
  routeInfoComponent = new BehaviorSubject<TemplateRef<any> | null>(null);
  /**
   * Route
   */
  private generateRoute$ = new Subject<TDirectionApiOptions['round_trip']>();
  isRefreshingRoute = signal(false);
  routeRef!: { polyline: Polyline<any> | undefined, polylineDecorator: any };
  routeObj!: any;
  routeOptions = {
    length: 5,
    points: 10,
    seed: getRandomNumber(0, 90)
  }
  routeProperties = signal({
    distance: 0,
    duration: 0
  })

  private initGeneratingRoute() {
    this.generateRoute$.pipe(
      debounceTime(700),
      map(payload => ({ round_trip: { ...payload, length: payload.length * 1000 } })),
      switchMap(payload => this.generateRoundTrip(payload)),
      tap(() => this.isRefreshingRoute.set(false)),
    ).subscribe((res: any) => {
      console.log(res, 'res');
      this.routeObj = res.routes[0]
      const { distance, duration } = this.routeObj.summary
      this.routeProperties.set({ distance, duration })
      if (this.routeRef) {
        this.routeRef?.polyline?.remove()
        this.routeRef?.polylineDecorator?.remove()
      }
      this.routeRef = this.mapService.displayRoute(this.routeObj.geometry)
    })
  }

  generateRoundTrip(options: TDirectionApiOptions) {
    return from(Geolocation.getCurrentPosition()).pipe(
      switchMap(position => this.geoApi.getDirection([[position.coords.longitude, position.coords.latitude]], options))
    )
  }

  refreshRoundTrip() {
    this.routeOptions.seed = getRandomNumber(0, 90)
    this.isRefreshingRoute.set(true)
    this.generateRoute$.next(this.routeOptions)
  }

  changeOptions(property: keyof typeof RoundTripService.prototype.routeOptions, value: number) {
    this.routeOptions[property] = value
    this.generateRoute$.next(this.routeOptions)
  }

  generateRoute() {
    this.generateRoute$.next(this.routeOptions)
  }
  /**
   * Instructions
   */
  isInstructionsVisible$ = new BehaviorSubject<boolean>(false)
  private instructionIcon = icon({ iconUrl: 'assets/icons/instruction.svg', iconSize: [20, 20] })
  private instructionMarkers: Marker[] = []

  private initInstructions() {
    this.isInstructionsVisible$.subscribe(isVisible => {
      console.log(isVisible, 'isVisible');
      if(!this.routeObj) return;
      isVisible ? this.showInstructions() : this.removeInstructions()
    })
  }

  private showInstructions() {
    const coordinates = this.mapService._mapComponentReference?.decodePolyline(this.routeObj.geometry);
    if (!coordinates) return;

    const steps = this.routeObj.segments.flatMap((segment: any) => segment.steps);
    steps.forEach((step: any) => {
      const latLng = coordinates[step.way_points[0]] as any
      const createdMarker = marker(latLng, {icon: this.instructionIcon}).addTo(this.mapService._mapComponentReference?.mapReference as any);
      createdMarker.bindPopup(`<div class="tw-flex tw-items-center tw-gap-2"><img width="40" src="assets/icons/directions/${step.type}.svg" /><b>${step.instruction}</b></div><br>${step.distance} meters`).openPopup();
      this.instructionMarkers.push(createdMarker)
    });
  }

  private removeInstructions() {
    this.instructionMarkers.forEach(marker => marker.remove())
    this.instructionMarkers = []
  }

}
