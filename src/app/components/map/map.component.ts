import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { Subject } from 'rxjs';
import { MapService } from 'src/app/_services/map.service';
import * as polyline from '@mapbox/polyline';
import { Position, Geolocation } from '@capacitor/geolocation';
import '@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse.js';
import '@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse.css';
import 'leaflet-polylinedecorator';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <div class="map"></div>
  `,
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {
  // @Output() navigateToCurrentLocationClicked = new EventEmitter<void>();
  private hostRef = inject(ElementRef);
  private mapService = inject(MapService);
  mapReference: L.Map | null = null;
  // static leaflet = L;
  // isLoading = signal(false);
  // static mapCreated$ = new Subject<void>()
  // currentLocationMarker: L.Marker | null = null;

  // changeLoadingStatus(status: boolean) {
  //   this.isLoading.set(status);
  // }

  // zoom(type: 'in' | 'out') {
  //   if (!this.mapReference) return;
  //   type === 'in' ? this.mapReference.zoomIn() : this.mapReference.zoomOut();
  // }

  ngAfterViewInit() {
    this.mapReference = L.map(
      this.hostRef.nativeElement.querySelector('.map'),
      {
        center: [51.505, -0.09],
        zoom: 13,
      }
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      this.mapReference
    );
    this.mapService.mapCreated$.next(this);

    // setTimeout(() => {
    //   this.mapReference?.invalidateSize();
    // }, 5000);
    // MapComponent.mapCreated$.next();
    // this.mapService.mapReference = this;

    // const orsAPI = 'http://localhost:8080/ors/v2/directions/driving-car';
    // const start = '8.681495,49.41461'; // start point
    // const end = '8.687872,49.420318'; // end point
    // const requestUrl = orsAPI + '?start=' + start + '&end=' + end;

    // fetch(requestUrl)
    //   .then(response => response.json())
    //   .then(data => {
    //     const orsRoute = data.features[0];
    //     const coordinates = orsRoute.geometry.coordinates.map((c: any) => [c[1], c[0]]);
    //     this.displayRoute(coordinates);
    //   });
  }

  decodePolyline(polylineString: string) {
    return polyline.decode(polylineString).map((c: any) => [c[0], c[1]]);
  }

  displayPolyline(coordinates: any) {
    if (!this.mapReference) return;
    const polyline = L.polyline(coordinates, { color: 'red' }).addTo(this.mapReference);
    this.mapReference.fitBounds(polyline.getBounds());
    return polyline;
  }

  addPolylineDecorator(polyline: any) {
    const l = L as any
    return l.polylineDecorator(polyline, {
      patterns: [
        { offset: 0, repeat: 80, symbol: l.Symbol.arrowHead({ pixelSize: 5, polygon: false, pathOptions: { stroke: true, color: '#000000' } }) }
      ]
    })
  }

  // navigateToCurrentLocation() {
  //   this.mapReference?.locate({setView: true, maxZoom: 16});
  // }

  // async getCurrentLocation() {
  //   try {
  //     const coordinates = await Geolocation.getCurrentPosition();
  //     this.mapReference && this.createMapMarker(coordinates.coords.latitude, coordinates.coords.longitude, 'user').addTo(this.mapReference)
  //     console.log('Current', coordinates);
  //   } catch (error) {
  //     console.error('Error getting location', error);
  //   }
  // }

  // showUserLocationOnMap(lat: number, lng: number) {
  //   if (!this.mapReference) return;
  //   this.currentLocationMarker && this.mapReference.removeLayer(this.currentLocationMarker)
  //   this.currentLocationMarker = this.createMapMarker(lat, lng, 'user')
  //   this.currentLocationMarker.addTo(this.mapReference)
  // }

  // static parseWkt<T>(str: string): {
  //   type: 'Point' | 'LineString' | 'Polygon';
  //   coordinates: T;
  // } {
  //   return parse(str);
  // }

  // static stringifyWkt(geoJSON: any) {
  //   return stringify(geoJSON);
  // }

  // addElementToMap(element: L.Icon | L.Marker | L.Polyline | L.Polygon | L.LayerGroup | L.Layer | any) {
  //   if (!this.mapReference) return;
  //   element.addTo(this.mapReference);
  // }

  createMapMarker(
    lat: number,
    lng: number,
    type?: 'stops' | 'lines' | 'busses' | 'default' | 'user'
  ) {
    if (type === 'user') {
      return L.marker([lat, lng], { icon: userIcon });
    }

    return L.marker([lat, lng], { icon: locationIcon });
  }

  // createLine(geoJSON: any) {
  //   if (!this.mapReference) return;
  //   return L.geoJSON(geoJSON, { style: lineStyle })
  // }

  // getCenter(offsetX = 0, offsetY = 0) {
  //   if (!this.mapReference) return null
  //   const center = this.mapReference.getCenter();
  //   if (center) {
  //     // Convert the center to pixel coordinates
  //     let point = this.mapReference.latLngToContainerPoint(center);
  //     // Adjust the coordinates
  //     point = point.add([offsetX, offsetY]);
  //     // Convert the coordinates back to a latitude and longitude
  //     return this.mapReference.containerPointToLatLng(point);
  //   }
  //   return null
  // }

  // navigateTo(lat: number, lng: number) {
  //   if (!this.mapReference) return;
  //   this.mapReference.setView([lat, lng], 13);
  // }
}

const userIcon = L.icon({
  iconUrl: '/assets/icon/location.png',
  iconSize: [45, 53], // size of the icon
  // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
  // shadowAnchor: [4, 62],  // the same for the shadow
  // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const locationIcon = L.icon({
  iconUrl: '/assets/img/location.png',
  iconSize: [38, 95], // size of the icon
  iconAnchor: [30, 69], // point of the icon which will correspond to marker's location
});

const lineStyle = {
  color: '#ff7800',
  weight: 5,
  opacity: 0.65,
};


export const myLocationPulsingIcon = (L.icon as any).pulse({
  iconSize:[20,20],
  color:'#4e8cff',
  fillColor: '#3B7FFC',
  heartbeat: 2
});
