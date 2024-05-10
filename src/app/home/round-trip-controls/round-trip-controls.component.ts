import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { IonRange, IonButton, IonIcon, IonGrid, IonCol, IonRow, IonToggle, IonItem, IonList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { helpCircleOutline, navigateOutline, optionsOutline, addOutline, refreshOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { BottomSheetService } from 'src/app/components/bottom-sheet/bottom-sheet.service';
import { haptic, showNativeDialog } from 'src/app/helpers/methods/native';
import { ImpactStyle } from '@capacitor/haptics';
import { MapService } from 'src/app/_services/map.service';
import { RoundTripService } from './round-trip.service';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';
import { TimePipe } from 'src/app/_pipes/time.pipe';

addIcons({ navigateOutline, optionsOutline, helpCircleOutline, addOutline, refreshOutline, chevronDownOutline, chevronUpOutline })

@Component({
  selector: 'app-round-trip-controls',
  standalone: true,
  imports: [IonList, IonItem, IonToggle, CommonModule, IonRange, IonButton, IonIcon, IonGrid, IonCol, IonRow, DistancePipe, TimePipe],
  templateUrl: './round-trip-controls.component.html',
  styleUrl: './round-trip-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripControlsComponent implements AfterViewInit {
  @ViewChild('options') optionsRef!: TemplateRef<any>
  @ViewChild('routeInfo') routeInfoRef!: TemplateRef<any>
  bottomSheetService = inject(BottomSheetService)
  mapService = inject(MapService)
  roundTripService = inject(RoundTripService)
  isRouteInfoSubsectionVisible = signal(false)

  ngAfterViewInit(): void {
    this.bottomSheetService.setSubSection(this.optionsRef)
    this.roundTripService.routeInfoComponent.next(this.routeInfoRef)
  }

  lengthChanged(value: any) {
    haptic(ImpactStyle.Medium)
    this.roundTripService.changeOptions('length', value)
    this.roundTripService.generateRoute()
  }

  pointsChanged(value: any) {
    haptic(ImpactStyle.Medium)
    this.roundTripService.changeOptions('points', value)
    this.roundTripService.generateRoute()
  }

  refreshClicked() {
    haptic(ImpactStyle.Light)
    this.roundTripService.refreshRoundTrip()
  }

  showInfoDialog() {
    haptic(ImpactStyle.Light)
    showNativeDialog({
      title: 'Points',
      message: 'The number of points to use on the route. Larger values create more circular routes.',
      buttonTitle: 'Ok'
    })
  }

  toggleAdditionalSection() {
    haptic(ImpactStyle.Light)
    this.bottomSheetService.toggleSubsection()
  }
}
