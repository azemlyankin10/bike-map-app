import { Injectable, effect, signal } from '@angular/core';
import { BehaviorSubject, Subject, map, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { MapService } from 'src/app/_services/map.service';
import { MeasuringService } from 'src/app/_services/measuring.service';
import { latLng, polyline } from 'leaflet';
import { MapComponent } from '../map/map.component';
import { AppStateService } from 'src/app/_services/app-state.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  readonly navigationZoom = 16
  readonly mapVerticalOffset = -150
  isPaused$ = new BehaviorSubject<boolean>(false)
  isMapTouched = signal(false)
  private isTouchedOnes = false;
  private mapReference: MapComponent | null = null;

  constructor(public measuringService: MeasuringService, public mapService: MapService, private appState: AppStateService) {
    effect(() => {
      this.isMapTouched() && (this.isTouchedOnes = true)
      if (!this.isMapTouched() && this.isTouchedOnes && this.mapReference) {
        const { lat, lon } = this.mapService.userCurrentLocation$.value!
        this.mapReference.mapReference?.setView([lat, lon], this.navigationZoom)
        this.mapService._mapComponentReference?.mapDomElement.nativeElement.classList.add('animateRotation')
        // const latLng = this.mapReference.getAdjustedMapViewCoordinates(lat, lon, 0, this.mapVerticalOffset)
        // if (!latLng) return;
        // this.mapReference.mapReference?.setView(latLng, this.navigationZoom, { animate: true, duration: 1 })
      } else if(this.isMapTouched()) {
        this.mapService._mapComponentReference?.mapDomElement.nativeElement.classList.remove('animateRotation')
      }
    })
  }

  observeRoute$() {
    let currentStepIndex = 0
    const finish = new Subject<void>()
    return this.mapService.userCurrentLocation$.pipe(
      takeUntil(finish),
      map(coords => {
        if (!coords) return null
          const steps = this.appState.routeInstructionSteps();
          if (!steps.length) return null

          const currentStep = steps[currentStepIndex];
          if (isCloserToNextStep(coords, currentStep)) {
            if (currentStepIndex === steps.length - 1) {
              finish.next()
              // TODO: continue from here
              console.log('finish !!!!!!!!!!!!');

              return null
            }
            currentStepIndex++;
          }
        return { ...currentStep, remainingDistance:  latLng(currentStep.latLng as any).distanceTo(latLng(coords.lat, coords.lon)) }
      })
    )
  }

  pause() {
    this.isPaused$.next(true)
    // timer
    this.measuringService.control('pause')
  }

  resume() {
    this.isPaused$.next(false)
    //timer
    this.measuringService.control('resume')
  }

  stop() {
    this.isPaused$.next(false)
    // timer
    this.measuringService.control('stop')
  }

  traceUserLocation() {
    return this.mapService.mapCreated$.pipe(
      switchMap((mapComponent) => {
        // if (!mapComponent) return;
        this.mapReference = mapComponent; // Save the map reference
        console.log('tracing user location');

        let passedDistancePolyline = polyline([], { color: '#3b7efc', weight: 10 }).addTo(mapComponent?.mapReference as any);
        let previousCoords: any | null = null;
        return this.mapService.userCurrentLocation$.pipe(tap(coords => {
          if (!coords) return;
          passedDistancePolyline.addLatLng([coords.lat, coords.lon]); // Add the new location to the polyline
          if (!this.isMapTouched()) {
            const _latLng = mapComponent?.getAdjustedMapViewCoordinates(coords.lat, coords.lon, 0, this.mapVerticalOffset)
            // const _latLng = latLng(coords.lat, coords.lon)
            if (!_latLng) return;
            mapComponent?.mapReference?.setView(_latLng, this.navigationZoom, { animate: true, duration: 1 })
            if (previousCoords) {
              mapComponent?.setDynamicMapRotationAngle(coords, previousCoords);
              // mapComponent?.debounceMarkerWhileRotating(this.mapService.myLocationMarker)
            }
            previousCoords = coords;
          }
        }))
      })
    )
  }
}

function isCloserToNextStep(coords: any, currentStep: any) {
  const distanceToEndOfStep = latLng(currentStep.latLng).distanceTo(latLng(coords.lat, coords.lon));

  return distanceToEndOfStep < 20;
}
