import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabBar, IonTabs, IonIcon, IonTabButton, IonLabel, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline, searchOutline, timerOutline, personOutline } from "ionicons/icons";
import { AppStateService } from 'src/app/_services/app-state.service';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [CommonModule, IonIcon, IonTabs, IonTabBar, IonTabButton, IonLabel, BottomSheetComponent, IonSearchbar],
  template: `
    <ion-tabs>
     <!-- @if (isShowNav()) { -->
      <ion-tab-bar slot="bottom" mode="ios">
        <ion-tab-button tab="home">
          <ion-icon name="map-outline" aria-hidden="true" />
          <ion-label>Map</ion-label>
        </ion-tab-button>
        <ion-tab-button (click)="searchClicked()">
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

    <app-bottom-sheet>
      <ion-searchbar animated="true" placeholder="Find location" mode="ios" show-clear-button="focus" />
    </app-bottom-sheet>
  `,
  styleUrl: './nav-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavTabsComponent implements OnInit {

  constructor(public appState: AppStateService, private route: ActivatedRoute, private router: Router) {
    addIcons({ mapOutline, searchOutline, timerOutline, personOutline})
  }

  searchClicked() {
    this.router.navigate(['/home'], { fragment: 'search' })
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      this.appState.isBottomSheetOpen$.next(fragment === 'search')
    })
    this.appState.isBottomSheetOpen$.subscribe(isSearchMode => {
      // this.appState.isBottomSheetOpen$.next(isSearchMode)
      if (!isSearchMode) {
        this.router.navigate(['/home'])
      }
    })
  }
}
