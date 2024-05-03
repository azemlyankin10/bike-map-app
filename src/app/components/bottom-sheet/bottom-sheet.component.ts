import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, inject } from '@angular/core';
import { GestureController } from '@ionic/angular';
import { AppStateService } from 'src/app/_services/app-state.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="button-sheet-up-line" (click)="toggleSheet()"></button>
    <ng-content />
  `,
  styleUrl: './bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent implements AfterViewInit, OnInit {
  hostRef = inject(ElementRef);
  gestureCtrl = inject(GestureController);
  appState = inject(AppStateService);

  swipe(deltaY: number) {
    if (deltaY < -50) {
      // Swipe up more than 50px, add 'open' class
      this.appState.isBottomSheetOpen$.next(true);
    } else if (deltaY > 200) {
      // Swipe down more than 200px, remove 'open' class
      this.appState.isBottomSheetOpen$.next(false);
    }

  }

  toggleSheet() {
    if (this.hostRef.nativeElement.classList.contains('open')) {
      this.appState.isBottomSheetOpen$.next(false);
    } else {
      this.appState.isBottomSheetOpen$.next(true);
    }
  }

  ngOnInit() {
    this.appState.isBottomSheetOpen$.subscribe(isOpen => {
      isOpen ? this.hostRef.nativeElement.classList.add('open') : this.hostRef.nativeElement.classList.remove('open');
    })
  }

  ngAfterViewInit() {
    const gesture = this.gestureCtrl.create({
      el: this.hostRef.nativeElement,
      gestureName: 'swipe',
      direction: 'y',
      onStart: () => {
        this.hostRef.nativeElement.classList.add('touching');
      },
      onMove: ev => this.swipe(ev.deltaY),
      onEnd: () => {
        this.hostRef.nativeElement.classList.remove('touching');
      },
    });
    gesture.enable();
  }
}
