import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonSearchbar, IonRange, IonContent } from '@ionic/angular/standalone';
import { MapComponent } from '../components/map/map.component';
import { ViewDidEnter } from '@ionic/angular';
import { BottomSheetComponent } from '../components/bottom-sheet/bottom-sheet.component';
import { GeoApiService } from '../_services/api/geo.api.service';
import { MapService } from '../_services/map.service';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AppStateService } from '../_services/app-state.service';
import { SegmentValue } from '@ionic/core';
import { RoundTripControlsComponent } from './round-trip-controls/round-trip-controls.component';
import { marker } from 'leaflet';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonSearchbar, MapComponent, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonLabel, RoundTripControlsComponent],
})
export class HomePage implements OnInit, ViewDidEnter {
  // isShowSearchMode = signal(false);
  // @ViewChild('bottomSheet') bottomSheet!: ElementRef
  selectedMode = signal<'default' | 'roundLoop'>('default')
  constructor(private getApi: GeoApiService, private mapService: MapService, private appState: AppStateService) {}

  modeChanged(mode: SegmentValue) {
    this.selectedMode.set(mode as 'default' | 'roundLoop')
    if (Capacitor.getPlatform() !== 'web') {
      Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  ionViewDidEnter() {
    // to fix the map size issue
    this.mapService._mapComponentReference?.mapReference?.invalidateSize();
  }

  ngOnInit() {
    // this.appState.isSearchMode$.subscribe(isSearchMode => this.isShowSearchMode.set(isSearchMode))
      // MapComponent.mapCreated$.subscribe(() => {
      //   // this.map.navigateToCurrentLocation()
      //   // this.map.getCurrentLocation()
      // })
console.log('home page');

      this.mapService.generateRoundTrip().subscribe((res: any) => {
        console.log(res, 'dadfasdfads')
        this.mapService.displayRoute(res.routes[0].geometry)


        ////
        // dispaly steps
        setTimeout(() => {
          const coordinates = this.mapService._mapComponentReference?.decodePolyline(res.routes[0].geometry);
          console.log(coordinates, 'coordinates');

          if (!coordinates) return;

          const steps = res.routes[0].segments.flatMap((segment: any) => segment.steps);
          steps.forEach((step: any, index: number) => {
            const latLng = coordinates[step.way_points[0]] as any
            const createdMarker = marker(latLng).addTo(this.mapService._mapComponentReference?.mapReference as any);
            createdMarker.bindPopup(`<b>${step.instruction}</b><br>${step.distance} meters`).openPopup();
          });
        }, 2000);
      })
  }


}
