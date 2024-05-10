import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonButton, IonCol, IonGrid, IonIcon, IonItem, IonList, IonRow, IonToggle } from '@ionic/angular/standalone';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
import { TimePipe } from 'src/app/_pipes/time.pipe';
import { RoundTripService } from '../round-trip.service';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
addIcons({ chevronDownOutline, chevronUpOutline })
@Component({
  selector: 'app-round-trip-route-info',
  standalone: true,
  imports: [AsyncPipe, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonList, IonItem, IonToggle, TimePipe, DistancePipe],
  template: `
    <ion-grid [fixed]="true">
      <ion-row>
        <ion-col class="tw-flex tw-items-center tw-justify-center">
          Distance: {{ roundTripService.routeProperties().distance | distance }}
        </ion-col>
        <ion-col class="tw-flex tw-items-center tw-justify-center">
          Duration: {{ roundTripService.routeProperties().duration | time: { showSeconds: false } }}
        </ion-col>
        <ion-col size="auto">
          <ion-button size="small" mode="ios" fill="solid" color="dark" (click)="isRouteInfoSubsectionVisible.set(!isRouteInfoSubsectionVisible())">
            <ion-icon slot="icon-only" name="chevron-{{isRouteInfoSubsectionVisible() ? 'up' : 'down'}}-outline"/>
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
    <div [class.tw-hidden]="!isRouteInfoSubsectionVisible()">
      <ion-list [inset]="true" mode="ios">
        <ion-item>
          <ion-toggle justify="space-between" [value]="roundTripService.isInstructionsVisible$ | async" (ionChange)="roundTripService.isInstructionsVisible$.next($event.detail.checked);">Show instructions</ion-toggle>
        </ion-item>
      </ion-list>
    </div>
  `,
  styleUrl: './round-trip-route-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripRouteInfoComponent {
  isRouteInfoSubsectionVisible = signal(false)
  roundTripService = inject(RoundTripService)
}
