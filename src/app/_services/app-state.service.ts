import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  isBottomSheetOpen$ = new BehaviorSubject<boolean>(false);
  // isSearchMode$ = new BehaviorSubject<boolean>(false);

  constructor() { }

}
