import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { AppStateService } from 'src/app/_services/app-state.service';
import { RouteSummaryService, TMeasuring } from './route-summary.service';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { takeUntil } from 'rxjs';
import { DurationToDatePipe } from 'src/app/_pipes/durationToDate.pipe';
import { DatePipe } from '@angular/common';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
addIcons({ addOutline });
@Component({
  selector: 'app-route-summary',
  standalone: true,
  imports: [IonButton, IonIcon, DurationToDatePipe, DistancePipe],
  template: `
    <h2 class="tw-text-2xl tw-text-center tw-mb-3 tw-text-gray-200">Summary</h2>
    <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-mb-3">
      @if (measuring()?.elapsedTime) {
        <div class="tw-text-center">
          <p class="tw-text-xl tw-font-bold tw-text-gray-100">Time</p>
          <span class="tw-text-2xl tw-text-gray-50">{{ measuring()?.elapsedTime | durationToDate: 'formatTimeWithNamesAndSeconds' }}</span>
        </div>
      }
      @if (measuring()?.traveledDistance) {
        <div class="tw-text-center">
          <p class="tw-text-xl tw-font-bold tw-text-gray-100">Distance</p>
          <span class="tw-text-2xl tw-text-gray-50">{{ measuring()?.traveledDistance | distance }}</span>
        </div>
      }
      @if(measuring()?.averageSpeed) {
        <div class="tw-text-center">
          <p class="tw-text-xl tw-font-bold tw-text-gray-100">Average speed</p>
          <span class="tw-text-2xl tw-text-gray-50">{{ measuring()?.averageSpeed }}</span>
        </div>
      }
    </div>
    <div class="tw-flex tw-gap-2">
      <!-- <ion-button color="success" size="large" mode="ios">
        <ion-icon slot="icon-only" name="add-outline" class="tw-text-gray-50"/>
      </ion-button> -->
      <ion-button color="danger" size="large" fill="solid" expand="block" class="tw-w-full" mode="ios" (click)="close()">
        <span class="tw-text-gray-50">Close</span>
      </ion-button>
    </div>
  `,
  styleUrl: './route-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteSummaryComponent implements OnInit {
  private IS_DESTROYED = destroyNotifier()
  private appState = inject(AppStateService)
  private routeSummaryService = inject(RouteSummaryService)
  measuring = signal<TMeasuring | null>(null)

  ngOnInit() {
    this.routeSummaryService.measuring$.pipe(takeUntil(this.IS_DESTROYED)).subscribe((measuring) => {
      this.measuring.set(measuring)
    })
  }

  close() {
    this.appState.appState$.next('default')
    this.routeSummaryService.closeSummary()
  }
}
