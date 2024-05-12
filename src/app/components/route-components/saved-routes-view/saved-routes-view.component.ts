import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle } from "@ionic/angular/standalone";
import { combineLatest, forkJoin, takeUntil } from 'rxjs';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
import { TimePipe } from 'src/app/_pipes/time.pipe';
import { RouteCollectionApiService } from 'src/app/_services/api/route-collection.api.service';
import { IRouteResponse, RoutesApiService } from 'src/app/_services/api/routes.api.service';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';

@Component({
  selector: 'app-saved-routes-view',
  standalone: true,
  imports: [DistancePipe, TimePipe, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle],
  template: `
    <ion-modal [isOpen]="isOpen" #modal>
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Saved routes</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="modal.dismiss(); isOpenChange.emit(false)">
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
                <ion-card-subtitle>{{ routeCollectionsValue?.get(route.collectionId) ?? 'Unknown' }}</ion-card-subtitle>
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
export class SavedRoutesViewComponent implements OnChanges {
  IS_DESTROYED = destroyNotifier()
  @Input({ required: true }) isOpen!: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>();
  routeApiService = inject(RoutesApiService)
  routes = signal<IRouteResponse[]>([])
  routeCollectionsApi = inject(RouteCollectionApiService)
  routeCollectionsValue!: Map<string, string> | undefined
  firstInit = true

  ngOnChanges(changes: SimpleChanges) {
    // init component only once when it was opened
    if (changes['isOpen'].currentValue && this.firstInit) {
      this.firstInit = false;

      combineLatest([this.routeCollectionsApi.getRouteCollections$(), this.routeApiService.getSavedRoutes()])
        .pipe(takeUntil(this.IS_DESTROYED))
        .subscribe(([routeCollections, routes]) => {
          console.log('routeCollections, routes');

          routeCollections && (this.routeCollectionsValue = new Map(routeCollections.map(collection => [collection._id, collection.name])))
          routes && this.routes.set(routes)
        })
    }
  }

}
