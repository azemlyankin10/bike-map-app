import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  isPaused$ = new BehaviorSubject<boolean>(false)
  constructor() { }

}
