import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { AssetsApiService, TRouteCollection } from 'src/app/_services/api/assets.api.service';
import { CreateRouteCollectionComponent } from '../create-route-collection/create-route-collection.component';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { takeUntil } from 'rxjs';

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
          <ion-select [value]="routeCollections()[0].id" (ionChange)="collection = $event.detail.value.toString()" aria-label="Route collection" placeholder="{{ (assetsApiService.isCollectionsRefreshing$ | async) ? 'Loading...' : 'Collection' }}" mode="ios" [disabled]="assetsApiService.isCollectionsRefreshing$ | async">
            @for (collection of routeCollections(); track collection.id) {
              <ion-select-option [value]="collection.id">{{ collection.name }}</ion-select-option>
            }
          </ion-select>
          <ion-button size="small" color="light" (click)="isCreateRouteCollectionOpen = !isCreateRouteCollectionOpen">
            <ion-icon slot="icon-only" name="add-outline" />
          </ion-button>
        } @else {
          <ion-button size="small" [color]="validations().collection ? 'light' : 'danger'" expand="full" class="tw-w-full" (click)="isCreateRouteCollectionOpen = !isCreateRouteCollectionOpen">
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
  assetsApiService = inject(AssetsApiService)
  isCreateRouteCollectionOpen = false
  name = ''
  collection = ''
  validations = signal({ name: true, collection: true })
  routeCollections = signal<TRouteCollection[]>([])

  ngOnInit() {
    this.assetsApiService.getRouteCollections$().pipe(takeUntil(this.IS_DESTROYED)).subscribe(routeCollections => { this.routeCollections.set(routeCollections ?? []) })
  }

  save() {
    this.validations.set({ name: !!this.name, collection: !!this.collection })


  }
}
