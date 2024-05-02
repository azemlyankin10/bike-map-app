import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  inject,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { parse, stringify } from './wkt';
import { Subject } from 'rxjs';

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
  @Output() navigateToCurrentLocationClicked = new EventEmitter<void>();
  private hostRef = inject(ElementRef);
  public mapReference: L.Map | null = null;
  static leaflet = L;
  isLoading = signal(false);
  static mapCreated$ = new Subject<void>()
  currentLocationMarker: L.Marker | null = null;

  changeLoadingStatus(status: boolean) {
    this.isLoading.set(status);
  }

  zoom(type: 'in' | 'out') {
    if (!this.mapReference) return;
    type === 'in' ? this.mapReference.zoomIn() : this.mapReference.zoomOut();
  }

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
    MapComponent.mapCreated$.next();
  }

  showUserLocationOnMap(lat: number, lng: number) {
    if (!this.mapReference) return;
    this.currentLocationMarker && this.mapReference.removeLayer(this.currentLocationMarker)
    this.currentLocationMarker = this.createMapMarker(lat, lng, 'user')
    this.currentLocationMarker.addTo(this.mapReference)
  }

  static parseWkt<T>(str: string): {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: T;
  } {
    return parse(str);
  }

  static stringifyWkt(geoJSON: any) {
    return stringify(geoJSON);
  }

  addElementToMap(element: L.Icon | L.Marker | L.Polyline | L.Polygon | L.LayerGroup | L.Layer | any) {
    if (!this.mapReference) return;
    element.addTo(this.mapReference);
  }

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

  createLine(geoJSON: any) {
    if (!this.mapReference) return;
    return L.geoJSON(geoJSON, { style: lineStyle })
  }

  getCenter(offsetX = 0, offsetY = 0) {
    if (!this.mapReference) return null
    const center = this.mapReference.getCenter();
    if (center) {
      // Convert the center to pixel coordinates
      let point = this.mapReference.latLngToContainerPoint(center);
      // Adjust the coordinates
      point = point.add([offsetX, offsetY]);
      // Convert the coordinates back to a latitude and longitude
      return this.mapReference.containerPointToLatLng(point);
    }
    return null
  }

  // navigateTo(lat: number, lng: number) {
  //   if (!this.mapReference) return;
  //   this.mapReference.setView([lat, lng], 13);
  // }
}

const userIcon = L.icon({
  iconUrl: '/assets/img/user-map-marker.png',
  iconSize: [45, 53], // size of the icon
  // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
  // shadowAnchor: [4, 62],  // the same for the shadow
  // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const locationIcon = L.icon({
  iconUrl: '/assets/img/location.svg',
  iconSize: [38, 95], // size of the icon
  iconAnchor: [30, 69], // point of the icon which will correspond to marker's location
});

const lineStyle = {
  color: '#ff7800',
  weight: 5,
  opacity: 0.65,
};
