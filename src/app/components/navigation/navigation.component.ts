import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { navigateOutline, pauseOutline, playCircleOutline, stopCircleOutline } from 'ionicons/icons';
import { NavigationService } from './navigation.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { Observable, takeUntil, tap } from 'rxjs';
import { haptic } from 'src/app/helpers/methods/native';
import { ImpactStyle } from '@capacitor/haptics';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
import { DurationToDatePipe } from 'src/app/_pipes/durationToDate.pipe';

addIcons({ pauseOutline, playCircleOutline, stopCircleOutline, navigateOutline });
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [IonButton, IonIcon, AsyncPipe, DistancePipe, DurationToDatePipe, DatePipe],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  IS_DESTROYED = destroyNotifier()
  // measuringService = inject(MeasuringService)
  navigationCommunication = inject(NavigationService)
  // mapService = inject(MapService)
  elapsedTime$!: Observable<number>
  traveledDistance$!: Observable<number>
  currentSpeed$!: Observable<string>
  averageSpeed$!: Observable<string>
  storeLastMeasurement = { elapsedTime: 0, traveledDistance: 0, averageSpeed: '' }


  ngOnInit() {
    console.log('NavigationComponent');

    this.navigationCommunication.isPaused$.pipe(takeUntil(this.IS_DESTROYED)).subscribe(() => {
      haptic(ImpactStyle.Medium)
    })
    /// measuring
    this.elapsedTime$ = this.navigationCommunication.measuringService.elapsedTime$().pipe(takeUntil(this.IS_DESTROYED), tap((time) => this.storeLastMeasurement.elapsedTime = time))
    this.traveledDistance$ = this.navigationCommunication.measuringService.traveledDistance$().pipe(takeUntil(this.IS_DESTROYED), tap((distance) => this.storeLastMeasurement.traveledDistance = distance))
    this.currentSpeed$ = this.navigationCommunication.measuringService.currentSpeed$().pipe(takeUntil(this.IS_DESTROYED))
    this.averageSpeed$ = this.navigationCommunication.measuringService.averageSpeed$().pipe(takeUntil(this.IS_DESTROYED), tap((speed) => this.storeLastMeasurement.averageSpeed = speed))
    this.navigationCommunication.measuringService.control('start') /// start timer

    // // trace user location
    this.navigationCommunication.traceUserLocation().pipe(takeUntil(this.IS_DESTROYED)).subscribe()

    // observe map touch
    this.navigationCommunication.mapService.mapCreated$.pipe(takeUntil(this.IS_DESTROYED)).subscribe((mapComponent) => {
      if (!mapComponent) return;
      mapComponent?.mapDomElement.nativeElement.classList.add('animateRotation')

      mapComponent.mapReference?.on('dragstart', () => {
        this.navigationCommunication.isMapTouched.set(true)
      })
      // mapComponent.mapReference?.on('rotatestart', () => {
      //   this.navigationCommunication.isMapTouched.set(true)
      // })
      // mapComponent.mapReference?.on('zoomstart', () => {
      //   this.navigationCommunication.isMapTouched.set(true)
      // })
    })

    // destroy component
    this.IS_DESTROYED.subscribe(() => {
      // additional actions in the navigation service - stop method
      this.navigationCommunication.routeSummaryService.measuring$.next(this.storeLastMeasurement)
    })
  }

}
