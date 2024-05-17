import { Injectable, TemplateRef, signal } from '@angular/core';
import { BehaviorSubject, Subject, catchError, debounceTime, from, map, of, switchMap, tap } from 'rxjs';
import { GeoApiService, TDirectionApiOptions } from 'src/app/_services/api/geo.api.service';
import { Geolocation } from '@capacitor/geolocation';
import { MapService } from 'src/app/_services/map.service';
import { Marker, Polyline, icon, marker } from 'leaflet';
import { getRandomNumber } from 'src/app/helpers/functions/getRandomNumber';
import { ToastController } from '@ionic/angular';
import { IRouteResponse } from 'src/app/_models/routeResponse';
import { AppStateService } from 'src/app/_services/app-state.service';
import { NavigationService } from 'src/app/components/navigation/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class RoundTripService {
  isSaveRouteVisible$ = new BehaviorSubject<boolean>(false)
  isSavedRouteViewVisible$ = new BehaviorSubject<boolean>(false)
  constructor(private geoApi: GeoApiService, private mapService: MapService, private toastController: ToastController, private appState: AppStateService, private navigationService: NavigationService) {
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
  routeResponseData!: IRouteResponse | null;
  // private interactGeneratingRoute$ = new Subject<void>()
  isRouteExist$ = new BehaviorSubject<boolean>(false)
  routeOptions = {
    length: 5,
    points: 10,
    seed: getRandomNumber(0, 90)
  }
  routeProperties = signal({
    distance: 0,
    duration: 0
  })

  closeRoundTrip() {
    this.isRouteExist$.next(false)
    this.routeProperties.set({ distance: 0, duration: 0 })
    this.routeRef?.polyline?.remove()
    this.routeRef?.polylineDecorator?.remove()
    this.routeResponseData = null
  }

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
        this.isRouteExist$.next(true)
        this.routeResponseData = res
        const route = res.routes[0]
        const { distance, duration } = route.summary
        this.routeProperties.set({ distance, duration })
        if (this.routeRef) {
          this.routeRef?.polyline?.remove()
          this.routeRef?.polylineDecorator?.remove()
        }
        this.routeRef = this.mapService.displayRoute(route.geometry)
        this.mapService._mapComponentReference?.setRotationToNorth()
      })
  }

  generateRoundTrip(options: TDirectionApiOptions) {
    return of(this.mapService.userCurrentLocation$.value).pipe(
      tap(position => console.log(position, 'position')),
      map(location => location ?? ({ lat: 0, lon: 0 }) ),
      switchMap(({lat, lon}) => this.geoApi.getDirection([[lon, lat]], options))
    )
  }

  refreshRoundTrip() {
    this.routeOptions.seed = getRandomNumber(0, 90)
    // this.isRefreshingRoute.set(true)
    this.generateRoute$.next(this.routeOptions)
  }

  changeOptions(property: keyof typeof RoundTripService.prototype.routeOptions, value: number) {
    this.routeOptions[property] = value
    // if (!this.isRouteExist$.value) return
    // this.generateRoute$.next(this.routeOptions)
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
      if(!this.routeResponseData?.routes[0]) return;
      isVisible ? this.showInstructions() : this.removeInstructions()
    })
  }

  private showInstructions() {
    if (!this.routeResponseData) return;
    const steps = this.mapService.parseInstructionsAndReturnSteps(this.routeResponseData.routes[0])
    if (!steps) return;
    steps.forEach((step: any) => {
      const createdMarker = marker(step.latLng, {icon: this.instructionIcon}).addTo(this.mapService._mapComponentReference?.mapReference as any);
      createdMarker.bindPopup(`<div class="tw-flex tw-items-center tw-gap-2"><img width="40" src="assets/icons/directions/${step.type}.svg" /><b>${step.instruction}</b></div><br>${step.distance} meters`)
      this.instructionMarkers.push(createdMarker)
    });
  }

  private removeInstructions() {
    this.instructionMarkers.forEach(marker => marker.remove())
    this.instructionMarkers = []
  }
  /**
   * Navigation
   */
  startNavigation() {
    if (!this.routeResponseData) return;
    console.log('Start navigation');
    this.appState.appState$.next('navigation')
    this.navigationService.routeRef = { polyline: this.routeRef.polyline, polylineDecorator: this.routeRef.polylineDecorator }
    const steps = this.mapService.parseInstructionsAndReturnSteps(this.routeResponseData.routes[0])
    if (!steps) return;
    this.appState.routeInstructionSteps.set(steps)
  }
}
