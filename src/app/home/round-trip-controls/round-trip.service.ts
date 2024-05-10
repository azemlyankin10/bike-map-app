import { Injectable, TemplateRef, signal } from '@angular/core';
import { BehaviorSubject, Subject, catchError, debounceTime, from, map, of, switchMap, tap } from 'rxjs';
import { GeoApiService, TDirectionApiOptions } from 'src/app/_services/api/geo.api.service';
import { Geolocation } from '@capacitor/geolocation';
import { MapService } from 'src/app/_services/map.service';
import { Marker, Polyline, icon, marker } from 'leaflet';
import { getRandomNumber } from 'src/app/helpers/functions/getRandomNumber';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class RoundTripService {
  isSaveRouteVisible$ = new BehaviorSubject<boolean>(false)
  constructor(private geoApi: GeoApiService, private mapService: MapService, private toastController: ToastController) {
    this.initGeneratingRoute()
    this.initInstructions()
  }
  /**
   * Shared components
   */
  routeInfoComponent = new BehaviorSubject<TemplateRef<any> | null>(null);
  routeTopToolbar = new BehaviorSubject<TemplateRef<any> | null>(null);
  /**
   * Route
   */
  private generateRoute$ = new Subject<TDirectionApiOptions['round_trip']>();
  isRefreshingRoute$ = new BehaviorSubject<boolean>(false)
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
      tap(() => this.isRefreshingRoute$.next(true)),
      map(payload => ({ round_trip: { ...payload, length: payload.length * 1000 } })),
      switchMap(payload => this.generateRoundTrip(payload).pipe(
        catchError(e => {
          console.error(e, 'Failed to generate route');
          this.toastController.create({
            message: 'Failed to generate route',
            duration: 10000,
            position: 'top',
            buttons: [{ text: 'Close', role: 'cancel' }],
            mode: 'ios'
          }).then(toast => toast.present())
          return of(null)
        })
      )),
    ).subscribe((res: any) => {
        this.isRefreshingRoute$.next(false)
        if (!res) return;
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
      tap(position => console.log(position, 'position')),
      switchMap(position => this.geoApi.getDirection([[position.coords.longitude, position.coords.latitude]], options))
    )
  }

  refreshRoundTrip() {
    this.routeOptions.seed = getRandomNumber(0, 90)
    // this.isRefreshingRoute.set(true)
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
