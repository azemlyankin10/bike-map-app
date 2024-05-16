import { Injectable, inject } from '@angular/core';
import { Position, Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject, Observable, Subject, catchError, from, interval, of, share, shareReplay, switchMap, tap } from 'rxjs';
import { MapComponent, myLocationPulsingIcon } from '../components/map/map.component';
import { GeoApiService, TDirectionApiOptions } from './api/geo.api.service';
import { showNativeDialog } from '../helpers/methods/native';
import { CircleMarker, Map, Marker, circleMarker, divIcon, marker } from 'leaflet';
import { INavigateRoute } from '../_models/routeResponse';
let deleteMe: any = []
@Injectable({
  providedIn: 'root'
})
export class MapService {
  geoApi = inject(GeoApiService);
  public _mapComponentReference: MapComponent | null = null; // available after the map is created
  mapCreated$ = new BehaviorSubject<MapComponent | null>(null);
  myLocationMarker!: Marker
  public userCurrentLocation$ = new BehaviorSubject<{lat: number, lon: number} | null>(null);

  constructor() {
    this.mapCreated$.subscribe((mapComponent) => {
      if (!mapComponent) return;
      this._mapComponentReference = mapComponent;
      const mapRef = mapComponent.mapReference as Map

      // my location marker
      this.myLocationMarker = marker([0, 0], { icon: myLocationPulsingIcon }).addTo(mapRef);
      let isFirstLocationUpdate = true
      this.subscribeToCurrentLocation$().subscribe(({ coords: { latitude, longitude } }) => {
        this.userCurrentLocation$.next({ lat: latitude, lon: longitude })
        this.myLocationMarker.setLatLng([latitude, longitude]);
        if (isFirstLocationUpdate) {
          mapRef.setView([latitude, longitude], 13);
          isFirstLocationUpdate = false;
        }
      })
    });


  }

  subscribeToCurrentLocation$() {
    // ///
    // TODO: delete this
    let latitude = 51.0459008;
    let longitude = 4.3399518;
    let watchId = 0;
    return interval(1000).pipe(
      tap(() => {
        // // latitude+=getRandomNumber(-0.0001, -0.0005);
        // // longitude+=getRandomNumber(-0.0001, -0.0005);
        // latitude+= 0.0001;
        // longitude+= 0.0001;
        const cords = deleteMe[watchId]
        if (!cords) return;
        latitude = cords[0]
        longitude = cords[1]
        watchId++;
      }),
      switchMap(() => {
        return of({ coords: { latitude, longitude } } as Position)
      }),

    )
    /////
    // let watchId: string;
    // return new Observable<Position>((observer) => {
    //   Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
    //     // console.log(position);

    //     // showNativeDialog({ message: JSON.stringify(position) })
    //     if (err) {
    //       observer.error(err);
    //       return;
    //     }
    //     observer.next(position as Position);
    //   }).then((id) => watchId = id);

    //   return () => Geolocation.clearWatch({ id: watchId });
    // });
  }

  displayRoute(geometryLine: string) {
    const decoded = this._mapComponentReference?.decodePolyline(geometryLine);
    // TODO: delete this
    // needs to be deleted
    console.log(decoded);
    deleteMe = decoded;
    ///
    const polyline = this._mapComponentReference?.displayPolyline(decoded);
    const polylineDecorator = this._mapComponentReference?.addPolylineDecorator(polyline).addTo(this._mapComponentReference?.mapReference);
    return { polyline, polylineDecorator };
  }

  parseInstructionsAndReturnSteps(route: INavigateRoute) {
    if (!this._mapComponentReference) return;
    const coordinates = this._mapComponentReference.decodePolyline(route.geometry);
    if (!coordinates) return;
    const steps = (route as any).segments?.flatMap((segment:any) => segment.steps);
    if (!steps) return;
    return steps.map((step: any) => {
      const latLng = coordinates[step.way_points[0]];
      return { ...step, latLng };
    });
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


const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;
