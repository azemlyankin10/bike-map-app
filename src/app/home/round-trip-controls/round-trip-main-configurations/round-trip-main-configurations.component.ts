import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonButton, IonIcon, IonRange } from '@ionic/angular/standalone';
import { BottomSheetService } from 'src/app/components/bottom-sheet/bottom-sheet.service';
import { haptic, showNativeDialog } from 'src/app/helpers/methods/native';
import { RoundTripService } from '../round-trip.service';
import { addIcons } from 'ionicons';
import { addOutline, navigateOutline, optionsOutline, refreshOutline } from 'ionicons/icons';
import { AsyncPipe } from '@angular/common';

addIcons({ optionsOutline, addOutline, refreshOutline, navigateOutline })
@Component({
  selector: 'app-round-trip-main-configurations',
  standalone: true,
  imports: [IonButton, IonIcon, IonRange, AsyncPipe],
  template: `
  <div class="tw-flex tw-items-center tw-justify-between tw-mb-5">
  <h2 class="tw-font-bold tw-text-xl">Round trip configurations</h2>
  <ion-button size="small" style="--color: var(--ion-text-color);" (click)="toggleAdditionalSection()">
    <ion-icon slot="icon-only" name="options-outline"/>
  </ion-button>
  </div>
  <ion-range [value]="roundTripService.routeOptions.length" (ionChange)="lengthChanged($event.detail.value)" [min]="1" label="Length" [pin]="true" class="tw-pt-0 tw-mb-3" mode="ios" [disabled]="roundTripService.isRefreshingRoute$ | async">
    <p slot="end" class="tw-ml-3">100km</p>
  </ion-range>
  <div class="tw-flex tw-gap-2">
    <ion-button size="large" mode="ios" [disabled]="roundTripService.isRefreshingRoute$ | async" fill="solid" color="success" (click)="saveRouteClicked()">
      <ion-icon slot="icon-only" name="add-outline" class="tw-text-white"/>
    </ion-button>
    <ion-button size="large" mode="ios" [disabled]="roundTripService.isRefreshingRoute$ | async" fill="solid" color="medium"  (click)="refreshClicked()">
      <ion-icon slot="icon-only" name="refresh-outline" [class.rotate]="false" class="tw-text-white"/>
    </ion-button>
    <ion-button size="large" expand="block" mode="ios" style="--color: var(--ion-text-color);" [disabled]="roundTripService.isRefreshingRoute$ | async" class="tw-w-full">
      <ion-icon slot="start" name="navigate-outline" />
      Start
    </ion-button>
  </div>
  `,
  styleUrl: './round-trip-main-configurations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripMainConfigurationsComponent {
  bottomSheetService = inject(BottomSheetService)
  roundTripService = inject(RoundTripService)

  toggleAdditionalSection() {
    haptic(ImpactStyle.Light)
    this.bottomSheetService.toggleSubsection()
  }

  lengthChanged(value: any) {
    haptic(ImpactStyle.Medium)
    this.roundTripService.changeOptions('length', value)
    this.roundTripService.generateRoute()
  }

  refreshClicked() {
    haptic(ImpactStyle.Light)
    this.roundTripService.refreshRoundTrip()
  }

  saveRouteClicked() {
    haptic(ImpactStyle.Light)
    if (!this.roundTripService.routeResponseData?.routes?.length) {
      showNativeDialog({
        title: 'Error',
        message: 'No route to save',
        buttonTitle: 'Ok'
      })
      return
    }
    this.roundTripService.isSaveRouteVisible$.next(!this.roundTripService.isSaveRouteVisible$.value)
  }
}
