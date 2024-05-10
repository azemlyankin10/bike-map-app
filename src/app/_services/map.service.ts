import { Injectable, inject } from '@angular/core';
import { Position, Geolocation } from '@capacitor/geolocation';
import { Observable, Subject, catchError, from, of, shareReplay, switchMap } from 'rxjs';
import { MapComponent, myLocationPulsingIcon } from '../components/map/map.component';
import { GeoApiService, TDirectionApiOptions } from './api/geo.api.service';
import { showNativeDialog } from '../helpers/methods/native';
import { CircleMarker, Map, Marker, circleMarker, divIcon, marker } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  geoApi = inject(GeoApiService);
  public _mapComponentReference: MapComponent | null = null; // available after the map is created
  mapCreated$ = new Subject<MapComponent>();
  myLocationMarker!: Marker

  constructor() {
    this.mapCreated$.subscribe((mapComponent) => {
      this._mapComponentReference = mapComponent;
      const mapRef = mapComponent.mapReference as Map

      this.myLocationMarker = marker([0, 0], { icon: myLocationPulsingIcon }).addTo(mapRef);
      let isFirstLocationUpdate = true
      this.subscribeToCurrentLocation$().subscribe(({ coords: { latitude, longitude } }) => {
        this.myLocationMarker.setLatLng([latitude, longitude]);
        if (isFirstLocationUpdate) {
          mapRef.setView([latitude, longitude], 13);
          isFirstLocationUpdate = false;
        }
      })
    });
  }

  subscribeToCurrentLocation$() {
    let watchId: string;
    return new Observable<Position>((observer) => {
      Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
        // console.log(position);

        // showNativeDialog({ message: JSON.stringify(position) })
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
    const polyline = this._mapComponentReference?.displayPolyline(decoded);
    const polylineDecorator = this._mapComponentReference?.addPolylineDecorator(polyline).addTo(this._mapComponentReference?.mapReference);
    return { polyline, polylineDecorator };
  }

  // setViewToMyLocation() {
  //   Geolocation.getCurrentPosition().then(({ coords: { latitude, longitude } }) => {
  //     this._mapComponentReference?.mapReference?.setView([latitude, longitude], 13);
  //   })
  // }
}

// const pulsingIcon = divIcon({
//   iconSize: [20, 20],
//   className: 'pulse-circle'
// })


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
