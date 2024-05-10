import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { IonSpinner } from '@ionic/angular/standalone';
import { RoundTripService } from '../round-trip.service';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { Subscription, takeUntil, timeout, timer } from 'rxjs';

@Component({
  selector: 'app-round-trip-top-toolbar',
  standalone: true,
  imports: [IonSpinner],
  template: `
    @if (isSpinnerVisible()) {
      <div class="tw-flex tw-justify-end tw-items-center tw-gap-2">
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
