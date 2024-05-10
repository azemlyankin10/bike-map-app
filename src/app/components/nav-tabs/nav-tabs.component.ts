import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabBar, IonTabs, IonIcon, IonTabButton, IonLabel, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline, searchOutline, timerOutline, personOutline, syncCircleOutline } from "ionicons/icons";
import { AppStateService } from 'src/app/_services/app-state.service';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { RoundTripControlsComponent } from 'src/app/home/round-trip-controls/round-trip-controls.component';

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [CommonModule, IonIcon, IonTabs, IonTabBar, IonTabButton, IonLabel, BottomSheetComponent, IonSearchbar, RoundTripControlsComponent],
  template: `
    <ion-tabs>
     <!-- @if (isShowNav()) { -->
      <ion-tab-bar slot="bottom" mode="ios">
        <ion-tab-button tab="home">
          <ion-icon name="map-outline" aria-hidden="true" />
          <ion-label>Map</ion-label>
        </ion-tab-button>
        <ion-tab-button (click)="bs.open(); appState.appState$.next('round-trip')">
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

    <app-bottom-sheet #bs mode="small" (closeSheet)="appState.appState$.next('default')">
      <!-- <ion-searchbar animated="true" placeholder="Find location" mode="ios" show-clear-button="focus" /> -->
      <app-round-trip-controls />
    </app-bottom-sheet>
  `,
  styleUrl: './nav-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavTabsComponent {
  isRoundTripMode = signal(false)

  constructor(public appState: AppStateService, private route: ActivatedRoute, private router: Router) {
    addIcons({ mapOutline, searchOutline, timerOutline, personOutline, syncCircleOutline})
  }

  searchClicked() {
    this.router.navigate(['/home'], { fragment: 'search' })
  }

  // ngOnInit() {
  //   this.route.fragment.subscribe(fragment => {
  //     this.appState.isBottomSheetOpen$.next(fragment === 'search')
  //   })
  //   this.appState.isBottomSheetOpen$.subscribe(isSearchMode => {
  //     // this.appState.isBottomSheetOpen$.next(isSearchMode)
  //     if (!isSearchMode) {
  //       this.router.navigate(['/home'])
  //     }
  //   })
  // }

}
