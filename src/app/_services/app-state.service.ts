import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  appState$ = new BehaviorSubject<'round-trip' | 'default'>('default');
  // isBottomSheetOpen$ = new BehaviorSubject<boolean>(false);
  // isSearchMode$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  async setStatusBarStyle(mode: 'Light' | 'Dark') {
    if (Capacitor.getPlatform() !== 'web') {
      await StatusBar.setStyle({ style: Style[mode] });
    }
  };

}
