import { Injectable, inject } from '@angular/core';
import { Position, Geolocation } from '@capacitor/geolocation';
import { Observable, Subject, from, shareReplay, switchMap } from 'rxjs';
import { MapComponent } from '../components/map/map.component';
import { GeoApiService } from './api/geo.api.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  geoApi = inject(GeoApiService);
  public _mapComponentReference: MapComponent | null = null; // available after the map is created
  mapCreated$ = new Subject<MapComponent>();

  constructor() {
    this.mapCreated$.subscribe((mapComponent) => {
      this._mapComponentReference = mapComponent;
    });
  }

  subscribeToCurrentLocation$() {
    let watchId: string;
    return new Observable<Position>((observer) => {
      Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
        if (err) {
          observer.error(err);
          return;
        }
        observer.next(position as Position);
      }).then((id) => watchId = id);

      return () => Geolocation.clearWatch({ id: watchId });
    });
  }

  displayRoute(geometryLine: string) {
    const decoded = this._mapComponentReference?.decodePolyline(geometryLine);
    this._mapComponentReference?.displayPolyline(decoded);
  }

  generateRoundTrip() {
    return from(Geolocation.getCurrentPosition()).pipe(shareReplay(1), switchMap(position => this.geoApi.getDirection([[position.coords.longitude, position.coords.latitude]])))
  }
}



// // Create a marker for the current location and add it to the map
// this.currentLocationMarker = L.marker([8.681495, 49.41461]).addTo(this.mapReference);

// // Create a routing control and add it to the map
// this.routingControl = L.Routing.control({
//   router: L.Routing.osrmv1(customRouter as any),
//   waypoints: [
//     L.latLng(8.681495, 49.41461), // start point
//     L.latLng(8.687872, 49.420318) // end point
//   ],
//   routeWhileDragging: true
// }).addTo(this.mapReference);

// // Get the current location and update the marker's position
// navigator.geolocation.watchPosition((position) => {
//   const currentLocation = L.latLng(position.coords.latitude, position.coords.longitude);
//   this.currentLocationMarker.setLatLng(currentLocation);

//   // Check if the current location is close to the destination
//   const destination = this.routingControl.getWaypoints()[1].latLng;
//   if (currentLocation.distanceTo(destination) < 50) { // 50 meters
//     alert('You have reached your destination');
//   }
// }, (error) => {
//   console.error('Error getting location', error);
// }, {
//   enableHighAccuracy: true,
//   maximumAge: 1000, // Update location every second
// });
