import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonMenuButton, IonSearchbar } from '@ionic/angular/standalone';
import { MapComponent } from '../components/map/map.component';
import { GestureController } from '@ionic/angular';
import { BottomSheetComponent } from '../components/bottom-sheet/bottom-sheet.component';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonSearchbar, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, MapComponent, IonButton, IonMenuButton, BottomSheetComponent],
})
export class HomePage {
  @ViewChild('bottomSheet') bottomSheet!: ElementRef
  constructor(private gestureCtrl: GestureController) {}



}
