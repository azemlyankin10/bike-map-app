import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { IRouteCollectionList, RouteCollectionApiService } from 'src/app/_services/api/route-collection.api.service';
import { CreateRouteCollectionComponent } from '../create-route-collection/create-route-collection.component';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { takeUntil } from 'rxjs';
import { RoutesApiService } from 'src/app/_services/api/routes.api.service';

addIcons({ addOutline })
@Component({
  selector: 'app-save-route-view',
  standalone: true,
  imports: [IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon, AsyncPipe, CreateRouteCollectionComponent, NgClass],
  template: `
  <app-create-route-collection [(isOpen)]="isCreateRouteCollectionOpen" />
  <h2 class="tw-font-bold tw-text-xl tw-mb-4">Save the route</h2>
  <ion-list mode="ios">
    <ion-item mode="ios">
      <ion-input
        (ionChange)="name = $event.detail.value ?? ''"
        label="Name"
        labelPlacement="floating"
        placeholder="Enter text"
        mode="ios"
        errorText="Required"
        [ngClass]="{ 'ion-invalid ion-touched': !validations().name }"
      />
    </ion-item>
    <ion-item mode="ios">
      <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
        @if (routeCollections().length) {
          <ion-select
            [value]="collection"
            (ionChange)="collection = $event.detail.value"
            aria-label="Route collection"
            placeholder="{{ (routeCollectionApiService.isCollectionsRefreshing$ | async) ? 'Loading...' : 'Collection' }}"
            mode="ios"
            [disabled]="(routeCollectionApiService.isCollectionsRefreshing$ | async) || (routesApiService.isLoading$ | async)"
          >
            @for (collection of routeCollections(); track collection._id) {
              <ion-select-option [value]="collection._id">{{ collection.name }}</ion-select-option>
            }
          </ion-select>
          <ion-button size="small" color="light" (click)="isCreateRouteCollectionOpen = !isCreateRouteCollectionOpen">
            <ion-icon slot="icon-only" name="add-outline" />
          </ion-button>
        } @else {
          <ion-button
            size="small"
            [color]="validations().collection ? 'light' : 'danger'"
            expand="full"
            class="tw-w-full"
            [disabled]="routeCollectionApiService.isCollectionsRefreshing$ | async"
            (click)="isCreateRouteCollectionOpen = !isCreateRouteCollectionOpen"
          >
            <ion-icon slot="start" name="add-outline" />
            Create collection
          </ion-button>
        }
      </div>
    </ion-item>
  </ion-list>
  <ion-button class="tw-mt-6" expand="block" (click)="save()">Save</ion-button>
  `,
  styleUrl: './save-route-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveRouteViewComponent implements OnInit {
  private IS_DESTROYED = destroyNotifier()
  routeCollectionApiService = inject(RouteCollectionApiService)
  routesApiService = inject(RoutesApiService)
  isCreateRouteCollectionOpen = false
  name!: string
  collection!: string
  validations = signal({ name: true, collection: true })
  routeCollections = signal<IRouteCollectionList[]>([])
  @Output() saveRouteClicked = new EventEmitter<{ name: string, collection: string }>()

  ngOnInit() {
    this.routeCollectionApiService.getRouteCollections$().pipe(takeUntil(this.IS_DESTROYED)).subscribe(routeCollections => {
      if (routeCollections?.[0]) {
        this.collection = routeCollections[0]._id
      }
      this.routeCollections.set(routeCollections ?? [])
    })
  }

  save() {
    this.validations.set({ name: !!this.name, collection: !!this.collection })
    if(Object.values(this.validations()).some(v => !v)) return
    this.saveRouteClicked.emit({ name: this.name, collection: this.collection })
  }
}
