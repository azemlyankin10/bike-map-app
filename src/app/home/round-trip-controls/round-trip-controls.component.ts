import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { helpCircleOutline, navigateOutline, optionsOutline, addOutline, refreshOutline } from 'ionicons/icons';
import { BottomSheetService } from 'src/app/components/bottom-sheet/bottom-sheet.service';
import { RoundTripService } from './round-trip.service';
import { RoundTripRouteInfoComponent } from './round-trip-route-info/round-trip-route-info.component';
import { RoundTripAdditionalOptionsComponent } from './round-trip-additional-options/round-trip-additional-options.component';
import { RoundTripMainConfigurationsComponent } from './round-trip-main-configurations/round-trip-main-configurations.component';
import { RoundTripTopToolbarComponent } from './round-trip-top-toolbar/round-trip-top-toolbar.component';
import { IonModal, IonContent } from '@ionic/angular/standalone';
import { SaveRouteViewComponent } from 'src/app/components/route-components/save-route-view/save-route-view.component';
import { AsyncPipe } from '@angular/common';
import { RouteCollectionApiService } from 'src/app/_services/api/route-collection.api.service';
import { showNativeDialog } from 'src/app/helpers/methods/native';
import { GeoApiService } from 'src/app/_services/api/geo.api.service';
import { map } from 'rxjs';
import { RoutesApiService } from 'src/app/_services/api/routes.api.service';

addIcons({ navigateOutline, optionsOutline, helpCircleOutline, addOutline, refreshOutline })
@Component({
  selector: 'app-round-trip-controls',
  standalone: true,
  imports: [RoundTripAdditionalOptionsComponent, RoundTripRouteInfoComponent, RoundTripMainConfigurationsComponent, RoundTripTopToolbarComponent, IonModal, IonContent, SaveRouteViewComponent, AsyncPipe],
  template: `
    <ng-template #routeInfo><app-round-trip-route-info /></ng-template>
    <ng-template #topToolbar><app-round-trip-top-toolbar /></ng-template>
    <ng-template #options><app-round-trip-additional-options /></ng-template>
    <app-round-trip-main-configurations />
    <ion-modal #modal [isOpen]="roundTripService.isSaveRouteVisible$ | async" (didDismiss)="roundTripService.isSaveRouteVisible$.next(false)" [canDismiss]="true" [initialBreakpoint]="0.5" [breakpoints]="[0, 0.5]" mode="ios">
      <ng-template>
        <ion-content class="ion-padding">
          <app-save-route-view (saveRouteClicked)="saveRouteToCollection($event)" />
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styleUrl: './round-trip-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripControlsComponent implements AfterViewInit {
  @ViewChild('options') optionsRef!: TemplateRef<any>
  @ViewChild('routeInfo') routeInfoRef!: TemplateRef<any>
  @ViewChild('topToolbar') topToolbarRef!: TemplateRef<any>
  bottomSheetService = inject(BottomSheetService)
  roundTripService = inject(RoundTripService)
  // routeCollectionApi = inject(RouteCollectionApiService)
  routeApiService = inject(RoutesApiService)
  geoApi = inject(GeoApiService)

  ngAfterViewInit() {
    this.bottomSheetService.setSubSection(this.optionsRef)
    this.roundTripService.routeInfoComponent.next(this.routeInfoRef)
    this.roundTripService.routeTopToolbar.next(this.topToolbarRef)
  }

  async saveRouteToCollection({ name, collection }: { name: string, collection: string }) {
    if (!this.roundTripService.routeResponseData?.routes?.length) {
      showNativeDialog({
        title: 'Error',
        message: 'No route to save',
        buttonTitle: 'Ok'
      })
      return
    }
    const { metadata, routes: [route] } = this.roundTripService.routeResponseData
    if (!route) return
    const [location] = metadata.query.coordinates
    const routeInfo = {
      distance: route.summary.distance,
      duration: route.summary.duration,
      location: await this.geoApi.getLocationName(location[1], location[0]).pipe(map((res: any) => res.address.road ?? 'Unknown')).toPromise()
    }
    this.routeApiService.saveRoute(collection.toString(), name, metadata.query, routeInfo)
      .subscribe((res) => res && this.roundTripService.isSaveRouteVisible$.next(false))
  }
}
