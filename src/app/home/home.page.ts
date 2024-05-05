import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonMenuButton, IonSearchbar, IonTabBar, IonTabs, IonIcon } from '@ionic/angular/standalone';
import { MapComponent } from '../components/map/map.component';
import { ViewDidEnter } from '@ionic/angular';
import { BottomSheetComponent } from '../components/bottom-sheet/bottom-sheet.component';
import { GeoApiService } from '../_services/api/geo.api.service';
import { MapService } from '../_services/map.service';
import * as L from 'leaflet';
import { AppStateService } from '../_services/app-state.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [MapComponent, ],
})
export class HomePage implements OnInit, ViewDidEnter {
  // isShowSearchMode = signal(false);
  // @ViewChild('bottomSheet') bottomSheet!: ElementRef
  // @ViewChild('map') map!: MapComponent

  constructor(private getApi: GeoApiService, private mapService: MapService, private appState: AppStateService) {}

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

      // this.getApi.getDirection().subscribe((res: any) => {
      //   console.log(res, 'dadfasdfads')
      //   this.mapService.displayRoute(res.routes[0].geometry)


      //   ////
      //   // dispaly steps
      //   setTimeout(() => {
      //     const coordinates = this.map.decodePolyline(res.routes[0].geometry);
      //     const steps = res.routes[0].segments.flatMap((segment: any) => segment.steps);
      //     steps.forEach((step: any, index: number) => {
      //       const latLng = coordinates[step.way_points[0]] as any
      //       const marker = L.marker(latLng).addTo(this.mapService._mapComponentReference?.mapReference as any);
      //       marker.bindPopup(`<b>${step.instruction}</b><br>${step.distance} meters`).openPopup();
      //     });
      //   }, 2000);
      // })
  }


}
