import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle } from "@ionic/angular/standalone";
import { combineLatest, takeUntil } from 'rxjs';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
import { TimePipe } from 'src/app/_pipes/time.pipe';
import { RouteCollectionApiService } from 'src/app/_services/api/route-collection.api.service';
import { IRouteResponse, RoutesApiService } from 'src/app/_services/api/routes.api.service';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { GestureController } from '@ionic/angular';
import { haptic, showNativeConfirmDialog } from 'src/app/helpers/methods/native';
import { ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-saved-routes-card',
  standalone: true,
  imports: [DistancePipe, TimePipe, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent],
  template: `
    <ion-card class="tw-flex tw-overflow-hidden">
      <div class="tw-w-full card tw-transition-transform">
        <ion-card-header>
          <ion-card-title>{{ route.name }}</ion-card-title>
          <ion-card-subtitle>{{ routeCollectionValue }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <p>Distance: <span>{{ route.routeInfo.distance | distance }}</span></p>
          <p>Duration: <span>{{ route.routeInfo.duration | time }}</span></p>
          <p>Start location: <span>{{ route.routeInfo.location }}</span></p>
        </ion-card-content>
      </div>

      <div class="tw-mr-[-100%] buttons tw-transition-transform">
        <button class="tw-bg-red-500 active:tw-bg-red-600 tw-h-full tw-px-4 tw-text-white" (click)="remove()">Delete</button>
      </div>
    </ion-card>

  `,
  styles: `:host { display: block }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedRoutesCardComponent implements AfterViewInit {
  @Input({ required: true }) route!: IRouteResponse
  @Input({ required: true }) routeCollectionValue!: string
  private hostRef = inject(ElementRef);
  private gestureCtrl = inject(GestureController);
  @Input() parentContent!: IonContent;
  @Output() removeRoute = new EventEmitter<string>();

  ngAfterViewInit() {
    this.gestureSetup();
  }

  async remove() {
    const { value } = await showNativeConfirmDialog({
      message: 'Are you sure you want to delete this route?',
      title: 'Delete route',
      okButtonTitle: 'Delete',
      cancelButtonTitle: 'Cancel'
    })
    if (value) {
      this.removeRoute.emit(this.route._id)
    }
  }

  async gestureSetup() {
    const card = this.hostRef.nativeElement.querySelector('.card');
    const buttons = this.hostRef.nativeElement.querySelector('.buttons');
    const parentContent = await this.parentContent.getScrollElement()
    const gesture = this.gestureCtrl.create({
      el: this.hostRef?.nativeElement,
      gestureName: 'swipe',
      direction: 'x',
      onStart: () => {
        parentContent.style.overflow = 'hidden';
      },
      onMove: ev => {
        if (ev.deltaX > 50) return;
        if (buttons.offsetWidth < Math.abs(ev.deltaX) && ev.deltaX < 0) return;
        card.style.transform = `translateX(${ev.deltaX}px)`;
        buttons.style.transform = `translateX(${ev.deltaX}px)`;
      },
      onEnd: (ev) => {
        if (ev.deltaX > 30) {
          card.style.transform = `translateX(0)`;
          buttons.style.transform = `translateX(0)`;
        } else {
          card.style.transform = `translateX(${-buttons.offsetWidth}px)`;
          buttons.style.transform = `translateX(${-buttons.offsetWidth}px)`;
        }
        parentContent.style.overflow = 'auto';
        haptic(ImpactStyle.Light)
      },
    });
    gesture.enable();
  }
}

@Component({
  selector: 'app-saved-routes-view',
  standalone: true,
  imports: [DistancePipe, TimePipe, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, SavedRoutesCardComponent],
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

        <ion-content #modalContent>
          <div #swipeContainer>
            @for (route of routes(); track route._id) {
              <app-saved-routes-card [parentContent]="modalContent" [route]="route" [routeCollectionValue]="routeCollectionsValue?.get(route.collectionId) ?? 'Unknown'" (removeRoute)="removeRoute($event)" />
            }
          </div>
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

  removeRoute(routeId: string) {
    this.routeApiService.removeRoute(routeId).subscribe((res) => {
      if (res !== null) return;
      haptic(ImpactStyle.Light)
      this.routes.set(this.routes().filter(route => route._id !== routeId))
    })
  }

}
