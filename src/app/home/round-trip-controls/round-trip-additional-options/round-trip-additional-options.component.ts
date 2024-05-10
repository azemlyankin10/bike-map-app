import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonRange, IonIcon } from '@ionic/angular/standalone';
import { RoundTripService } from '../round-trip.service';
import { haptic, showNativeDialog } from 'src/app/helpers/methods/native';
import { ImpactStyle } from '@capacitor/haptics';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-round-trip-additional-options',
  standalone: true,
  imports: [IonRange, IonIcon, AsyncPipe],
  template: `
    <h2 class="tw-font-bold tw-text-sm tw-px-3 tw-mb-2">Additional</h2>
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-px-3">
      <ion-range [value]="roundTripService.routeOptions.points" [min]="3" [max]="30" (ionChange)="pointsChanged($event.detail.value)" label="Points" [pin]="true" class="tw-pt-0" mode="ios" [disabled]="roundTripService.isRefreshingRoute$ | async"/>
      <button class="tw-text-2xl tw-flex tw-items-center tw-justify-center active:tw-opacity-70 tw-transition-opacity" (click)="showInfoDialog()">
        <ion-icon slot="icon-only" name="help-circle-outline" />
      </button>
    </div>
  `,
  styleUrl: './round-trip-additional-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripAdditionalOptionsComponent {
  roundTripService = inject(RoundTripService)

  pointsChanged(value: any) {
    haptic(ImpactStyle.Medium)
    this.roundTripService.changeOptions('points', value)
    this.roundTripService.generateRoute()
  }

  showInfoDialog() {
    haptic(ImpactStyle.Light)
    showNativeDialog({
      title: 'Points',
      message: 'The number of points to use on the route. Larger values create more circular routes.',
      buttonTitle: 'Ok'
    })
  }
}
