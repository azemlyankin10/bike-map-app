import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { IonSpinner, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RoundTripService } from '../round-trip.service';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { Subscription, takeUntil, timer } from 'rxjs';
import { addIcons } from 'ionicons';
import { bookmarkOutline } from 'ionicons/icons';
import { SavedRoutesViewComponent } from 'src/app/components/route-components/saved-routes-view/saved-routes-view.component';
import { AsyncPipe } from '@angular/common';
addIcons({ bookmarkOutline })

@Component({
  selector: 'app-round-trip-top-toolbar',
  standalone: true,
  imports: [IonSpinner, IonButton, IonIcon, SavedRoutesViewComponent, AsyncPipe],
  template: `
    <ion-button size="large" mode="ios" fill="solid" color="success" (click)="roundTripService.isSavedRouteViewVisible$.next(!roundTripService.isSavedRouteViewVisible$.value)">
      <ion-icon slot="icon-only" name="bookmark-outline" class="tw-text-white"/>
    </ion-button>
    <app-saved-routes-view [isOpen]="!!(roundTripService.isSavedRouteViewVisible$ | async)" (isOpenChange)="roundTripService.isSavedRouteViewVisible$.next($event)" />
    @if (isSpinnerVisible()) {
      <div class="tw-ml-auto tw-flex tw-items-center tw-gap-2">
        <p class="tw-text-xl tw-text-gray-600 tw-font-bold">{{ statusText() }}</p>
        <ion-spinner name="circles" style="--color: #374151"/>
      </div>
    }
  `,
  styleUrl: './round-trip-top-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripTopToolbarComponent implements OnInit {
  private IS_DESTROYED = destroyNotifier()
  roundTripService = inject(RoundTripService)
  isSpinnerVisible = signal(false)
  statusText = signal('')

  ngOnInit() {
    this.handlingRouteGeneration()
  }

  private handlingRouteGeneration() {
    let timeout: Subscription
    this.roundTripService.isRefreshingRoute$.pipe(takeUntil(this.IS_DESTROYED)).subscribe((isRefreshing) => {
      this.isSpinnerVisible.set(isRefreshing)
      timeout?.unsubscribe()
      this.statusText.set('')
      timeout = timer(3000).subscribe(() => {
        this.statusText.set('Calculating route...')
      })
    })
  }
}
