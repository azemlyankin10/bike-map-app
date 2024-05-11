import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle } from "@ionic/angular/standalone";
import { map, tap } from 'rxjs';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
import { TimePipe } from 'src/app/_pipes/time.pipe';
import { IRouteResponse, RoutesApiService } from 'src/app/_services/api/routes.api.service';

@Component({
  selector: 'app-saved-routes-view',
  standalone: true,
  imports: [DistancePipe, TimePipe, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle],
  template: `
  <ion-modal [isOpen]="isOpen">
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Saved routes</ion-title>
          <ion-buttons slot="end">
            <ion-button (click)="isOpenChange.emit(false);">
              Close
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        @for (route of routes(); track route._id) {
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ route.name }}</ion-card-title>
              <ion-card-subtitle>{{ route.collectionName }}</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <p>Distance: <span>{{ route.routeInfo.distance | distance }}</span></p>
              <p>Duration: <span>{{ route.routeInfo.duration | time }}</span></p>
              <p>Start location: <span>{{ route.routeInfo.location }}</span></p>
            </ion-card-content>
          </ion-card>
        }
      </ion-content>
    </ng-template>
  </ion-modal>
  `,
  styleUrl: './saved-routes-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedRoutesViewComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  routeApiService = inject(RoutesApiService)
  routes = signal<IRouteResponse[]>([])

  ngOnInit() {
    this.routeApiService.getSavedRoutes().pipe().subscribe(routes => {
        console.log(routes, 'routes');
        if (!routes) return;
        this.routes.set(routes)
      })
  }

}
