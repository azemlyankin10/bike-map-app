import { Injectable, effect, signal } from '@angular/core';
import { BehaviorSubject, map, switchMap, tap } from 'rxjs';
import { MapService } from 'src/app/_services/map.service';
import { MeasuringService } from 'src/app/_services/measuring.service';
import { latLng, polyline } from 'leaflet';
import { MapComponent } from '../map/map.component';

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
  constructor(public measuringService: MeasuringService, public mapService: MapService) {
    effect(() => {
      this.isMapTouched() && (this.isTouchedOnes = true)
      if (!this.isMapTouched() && this.isTouchedOnes && this.mapReference) {
        const { lat, lon } = this.mapService.userCurrentLocation$.value!
        this.mapReference.mapReference?.setView([lat, lon], this.navigationZoom)
        // const latLng = this.mapReference.getAdjustedMapViewCoordinates(lat, lon, 0, this.mapVerticalOffset)
        // if (!latLng) return;
        // this.mapReference.mapReference?.setView(latLng, this.navigationZoom, { animate: true, duration: 1 })
      }
    })
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
        this.mapReference = mapComponent; // Save the map reference
        let passedDistancePolyline = polyline([], { color: 'red' }).addTo(mapComponent.mapReference as any);
        let previousCoords: any | null = null;
        return this.mapService.userCurrentLocation$.pipe(tap(coords => {
          if (!coords) return;
          passedDistancePolyline.addLatLng([coords.lat, coords.lon]); // Add the new location to the polyline
          if (!this.isMapTouched()) {
            const latLng = mapComponent.getAdjustedMapViewCoordinates(coords.lat, coords.lon, 0, this.mapVerticalOffset)
            if (!latLng) return;
            mapComponent.mapReference?.setView(latLng, this.navigationZoom, { animate: true, duration: 1 })
            // mapComponent.mapReference?.setView([coords.lat, coords.lon], this.navigationZoom)
            // Calculate rotation angle based on user's location
            if (previousCoords) {
              // const bearing = calculateBearing(previousCoords.lat, previousCoords.lon, coords.lat, coords.lon);
              const rad = (deg: any) => deg * Math.PI / 180;
              const bearing = calculateBearing(rad(previousCoords.lat), rad(previousCoords.lon), rad(coords.lat), rad(coords.lon));
              // let mapRotation = 90 - bearing;
              // if (mapRotation < 0) {
              //   console.log('mapRotation', mapRotation);

              //   mapRotation += 360;
              // }
              mapComponent.setRotationAngle(bearing - 65);
              // mapComponent.setRotationAngle(bearing);
            }
            previousCoords = coords;
          }
        }))
      })
    )
  }
}


function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // ensure the result is between 0 and 360
  return bearing;
}
