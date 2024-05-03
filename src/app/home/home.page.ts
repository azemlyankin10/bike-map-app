import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonMenuButton, IonSearchbar } from '@ionic/angular/standalone';
import { MapComponent } from '../components/map/map.component';
import { GestureController } from '@ionic/angular';
import { BottomSheetComponent } from '../components/bottom-sheet/bottom-sheet.component';
import { GeoApiService } from '../_services/api/geo.api.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonSearchbar, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, MapComponent, IonButton, IonMenuButton, BottomSheetComponent],
})
export class HomePage implements OnInit {
  @ViewChild('bottomSheet') bottomSheet!: ElementRef
  @ViewChild('map') map!: MapComponent

  constructor(private getApi: GeoApiService) {}

  ngOnInit() {
      MapComponent.mapCreated$.subscribe(() => {
        // this.map.navigateToCurrentLocation()
        // this.map.getCurrentLocation()
      })

      this.getApi.getDirection().subscribe((res: any) => {
        console.log(res, 'dadfasdfads')
      })
  }

}
