import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { MapService } from 'src/app/_services/map.service';
import * as polyline from '@mapbox/polyline';
import '@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse.js';
import '@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse.css';
import 'leaflet-polylinedecorator';
import 'leaflet-rotate';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  template: `
    <div #map class="map"></div>
  `,
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapDomElement!: ElementRef<HTMLDivElement>;
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
    // const rotateProps = {
    //   rotateControl: {
    //     closeOnZeroBearing: false,
    //     position: 'bottomleft',
    //   },
		// 		compassBearing: true,
    // }
    this.mapReference = L.map(
      this.hostRef.nativeElement.querySelector('.map'),
      {
        center: [51.505, -0.09],
        zoom: 13,
        preferCanvas: true,
        //
        rotate: true,
        // ...rotateProps as any,
				bearing: 0,
        rotateControl: false,
				// attributionControl: false,
				zoomControl: true,
				trackContainerMutation: true,
				// shiftKeyRotate: false,
				touchRotate: true,
				// touchZoom: true
        ////
      }
    );
    // 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
    // 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    // http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png
    // https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png // cycling additional map
    // https://tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png // mtb additional map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.mapReference);
    L.tileLayer('https://tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png').addTo(this.mapReference);

    this.mapService.mapCreated$.next(this);
  }

  setRotationToNorth() {
    if (!this.mapReference) return;
    this.mapReference.setBearing(0);
  }

  setDynamicMapRotationAngle(currentCoords: {lat: number, lon: number}, previousCoords: {lat: number, lon: number}) {
    if (!this.mapReference) return;
    // console.log(this.mapReference);
    const rad = (deg: any) => deg * Math.PI / 180;
    const bearing = calculateBearing(rad(previousCoords.lat), rad(previousCoords.lon), rad(currentCoords.lat), rad(currentCoords.lon));
    this.mapReference.setBearing(360 - bearing);
  }

  debounceMarkerWhileRotating(marker: L.Marker) {
    // this.mapService.myLocationMarker
    if (!this.mapReference) return;
    const markerPoint = this.mapReference.latLngToContainerPoint(marker.getLatLng())!
    // Convert the point to the rotated coordinate system
    const rotatedPoint = this.mapReference?.mapPanePointToRotatedPoint(markerPoint);
    // Set the marker's position using the rotated point
    marker.setLatLng(this.mapReference.containerPointToLatLng(rotatedPoint!)!);
  }

  getAdjustedMapViewCoordinates(lat: number, lng: number, offsetX = 0, offsetY = 0) {
    if (!this.mapReference) return;
    // const pixelCoords = this.mapReference.project(L.latLng(lat, lng), this.mapReference.getZoom());
    // const newPixelCoords = pixelCoords.add([offsetX, offsetY]); // Add -100 pixels to the y-coordinate
    // return this.mapReference.unproject(newPixelCoords, this.mapReference.getZoom());

    // Get the current map rotation angle in radians
    const rotationAngle = -(this.mapReference as any).getBearing() * Math.PI / 180;
    // Rotate the offset vector by the map rotation angle
    const rotatedOffsetX = offsetX * Math.cos(rotationAngle) - offsetY * Math.sin(rotationAngle);
    const rotatedOffsetY = offsetX * Math.sin(rotationAngle) + offsetY * Math.cos(rotationAngle);

    const pixelCoords = this.mapReference.project(L.latLng(lat, lng), this.mapReference.getZoom());
    const newPixelCoords = pixelCoords.add([rotatedOffsetX, rotatedOffsetY]); // Add the rotated offset to the pixel coordinates
    return this.mapReference.unproject(newPixelCoords, this.mapReference.getZoom());
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


function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // ensure the result is between 0 and 360
  return bearing;
}
