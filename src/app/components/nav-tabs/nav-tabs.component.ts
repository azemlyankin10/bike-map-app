import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabBar, IonTabs, IonIcon, IonTabButton, IonLabel, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline, searchOutline, timerOutline, personOutline, syncCircleOutline, time } from "ionicons/icons";
import { AppStateService } from 'src/app/_services/app-state.service';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { RoundTripControlsComponent } from 'src/app/home/round-trip-controls/round-trip-controls.component';
import { RoundTripService } from 'src/app/home/round-trip-controls/round-trip.service';
import { Subscription, timer } from 'rxjs';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [CommonModule, IonIcon, IonTabs, IonTabBar, IonTabButton, IonLabel, BottomSheetComponent, IonSearchbar, RoundTripControlsComponent, NavigationComponent],
  template: `
    <ion-tabs>
     <!-- @if (isShowNav()) { -->
      <ion-tab-bar slot="bottom" mode="ios">
        <ion-tab-button tab="home">
          <ion-icon name="map-outline" aria-hidden="true" />
          <ion-label>Map</ion-label>
        </ion-tab-button>
        <ion-tab-button (click)="appState.appState$.next('round-trip')">
          <ion-icon name="sync-circle-outline" aria-hidden="true" />
          <ion-label>Round trip</ion-label>
        </ion-tab-button>
        <ion-tab-button >
          <ion-icon name="search-outline" aria-hidden="true" />
          <ion-label>Search</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="history">
          <ion-icon name="timer-outline" aria-hidden="true" />
          <ion-label>History</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline" aria-hidden="true" />
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    <!-- } -->
    </ion-tabs>

    <app-bottom-sheet #bottomSheet [closeOnSwipe]="(appState.appState$ | async) === 'round-trip'" (closeSheet)="closeBottomSheet()">
      @if ((appState.appState$ | async) === 'round-trip') {
        <app-round-trip-controls />
      } @else if ((appState.appState$ | async) === 'navigation') {
        <app-navigation />
      }
    </app-bottom-sheet>
  `,
  styleUrl: './nav-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavTabsComponent implements OnInit {
  @ViewChild('bottomSheet') bottomSheet!: BottomSheetComponent
  // isRoundTripMode = signal(false)
  roundTripService = inject(RoundTripService)

  constructor(public appState: AppStateService, private route: ActivatedRoute, private router: Router) {
    addIcons({ mapOutline, searchOutline, timerOutline, personOutline, syncCircleOutline})
  }

  ngOnInit() {
    let timeout!: Subscription
    this.appState.appState$.subscribe(state => {
      timeout?.unsubscribe()
      if (['round-trip', 'navigation'].includes(state)) {
        timeout = timer(100).subscribe(() => {
          this.bottomSheet.open()
        })
      }
    })
  }

  searchClicked() {
    this.router.navigate(['/home'], { fragment: 'search' })
  }

  closeBottomSheet() {
    if (this.appState.appState$.value === 'round-trip'){
      this.appState.appState$.next('default')
      this.roundTripService.closeRoundTrip()
    }
  }

}
