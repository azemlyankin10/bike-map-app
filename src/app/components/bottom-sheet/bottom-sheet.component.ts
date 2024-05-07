import { CommonModule } from '@angular/common';
import { AfterViewInit, Attribute, ChangeDetectionStrategy, Component, ElementRef, effect, inject, signal } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
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
export class BottomSheetComponent implements AfterViewInit {
  hostRef = inject(ElementRef);
  gestureCtrl = inject(GestureController);
  appState = inject(AppStateService);

  isOpen = signal(false);

  constructor(@Attribute('mode') mode: 'small' | 'normal') {
    this.setMode(mode)

    effect(() => {
      this.isOpen() ? this.hostRef.nativeElement.classList.add('open') : this.hostRef.nativeElement.classList.remove('open');
    })
  }

  swipe(deltaY: number) {
    if (deltaY < -50) {
      // Swipe up more than 50px, add 'open' class
      this.open()
    } else if (deltaY > 200) {
      // Swipe down more than 200px, remove 'open' class
      this.hide()
    }
  }

  toggleSheet() {
    if (this.hostRef.nativeElement.classList.contains('open')) {
      this.hide()
    } else {
      this.open()
    }
  }

  open() {
    console.log('open');
    this.isOpen.set(true)
    if (Capacitor.getPlatform() !== 'web') {
      Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  hide() {
    this.isOpen.set(false)
    if (Capacitor.getPlatform() !== 'web') {
      Haptics.impact({ style: ImpactStyle.Light });
    }
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

  setMode(mode: TMode) {
    this.hostRef.nativeElement.classList.add(mode)
  }
}


type TMode = 'small' | 'normal'
