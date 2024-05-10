import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { helpCircleOutline, navigateOutline, optionsOutline, addOutline, refreshOutline } from 'ionicons/icons';
import { BottomSheetService } from 'src/app/components/bottom-sheet/bottom-sheet.service';
import { RoundTripService } from './round-trip.service';
import { RoundTripRouteInfoComponent } from './round-trip-route-info/round-trip-route-info.component';
import { RoundTripAdditionalOptionsComponent } from './round-trip-additional-options/round-trip-additional-options.component';
import { RoundTripMainConfigurationsComponent } from './round-trip-main-configurations/round-trip-main-configurations.component';

addIcons({ navigateOutline, optionsOutline, helpCircleOutline, addOutline, refreshOutline })
@Component({
  selector: 'app-round-trip-controls',
  standalone: true,
  imports: [RoundTripAdditionalOptionsComponent, RoundTripRouteInfoComponent, RoundTripMainConfigurationsComponent],
  template: `
    <ng-template #routeInfo><app-round-trip-route-info /></ng-template>
    <ng-template #options><app-round-trip-additional-options /></ng-template>
    <app-round-trip-main-configurations />
  `,
  styleUrl: './round-trip-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripControlsComponent implements AfterViewInit {
  @ViewChild('options') optionsRef!: TemplateRef<any>
  @ViewChild('routeInfo') routeInfoRef!: TemplateRef<any>
  bottomSheetService = inject(BottomSheetService)
  roundTripService = inject(RoundTripService)

  ngAfterViewInit() {
    this.bottomSheetService.setSubSection(this.optionsRef)
    this.roundTripService.routeInfoComponent.next(this.routeInfoRef)
  }
}
