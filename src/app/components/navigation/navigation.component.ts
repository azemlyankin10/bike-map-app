import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pauseOutline, playCircleOutline, stopCircleOutline } from 'ionicons/icons';
import { NavigationService } from './navigation.service';
import { AsyncPipe } from '@angular/common';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';
import { Observable, takeUntil } from 'rxjs';
import { haptic } from 'src/app/helpers/methods/native';
import { ImpactStyle } from '@capacitor/haptics';
import { MeasuringService } from 'src/app/_services/measuring.service';
import { TimePipe } from 'src/app/_pipes/time.pipe';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
addIcons({ pauseOutline, playCircleOutline, stopCircleOutline });
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [IonButton, IonIcon, AsyncPipe, TimePipe, DistancePipe],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  IS_DESTROYED = destroyNotifier()
  measuringService = inject(MeasuringService)
  navigationCommunication = inject(NavigationService)
  elapsedTime$!: Observable<number>
  traveledDistance$ = this.measuringService.traveledDistance$()
  currentSpeed$ = this.measuringService.currentSpeed$()

  ngOnInit() {
    this.navigationCommunication.isPaused$.pipe(takeUntil(this.IS_DESTROYED)).subscribe(() => {
      haptic(ImpactStyle.Medium)
    })

   this.elapsedTime$ = this.measuringService.elapsedTime$()
   this.measuringService.control('start') /// start timer
  }

  pause() {
    this.navigationCommunication.isPaused$.next(true)
    // timer
    this.measuringService.control('pause')
  }

  resume() {
    this.navigationCommunication.isPaused$.next(false)
    //timer
    this.measuringService.control('resume')
  }

  stop() {
    this.navigationCommunication.isPaused$.next(false)
    // timer
    this.measuringService.control('stop')
  }

}
