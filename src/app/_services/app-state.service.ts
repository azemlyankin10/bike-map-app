import { Injectable, signal } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  appState$ = new BehaviorSubject<'navigation' | 'round-trip' | 'default'>('default');
  routeInstructionSteps = signal<IRouteInstructionSteps[]>([])

  // isBottomSheetOpen$ = new BehaviorSubject<boolean>(false);
  // isSearchMode$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  async setStatusBarStyle(mode: 'Light' | 'Dark') {
    if (Capacitor.getPlatform() !== 'web') {
      await StatusBar.setStyle({ style: Style[mode] });
    }
  };

}


interface IRouteInstructionSteps {
  latLng: any[];
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: [number, number];
}
