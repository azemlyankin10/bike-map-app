import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, inject } from '@angular/core';
import { GestureController } from '@ionic/angular';

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
  // @Input() isOpen = false;
  hostRef = inject(ElementRef);
  gestureCtrl = inject(GestureController);

  swipe(deltaY: number) {
    if (deltaY < -50) {
      // Swipe up more than 50px, add 'open' class
      this.hostRef.nativeElement.classList.add('open');
    } else if (deltaY > 200) {
      // Swipe down more than 200px, remove 'open' class
      this.hostRef.nativeElement.classList.remove('open');
    }

  }

  toggleSheet() {
    if (this.hostRef.nativeElement.classList.contains('open')) {
      this.hostRef.nativeElement.classList.remove('open');
    } else {
      this.hostRef.nativeElement.classList.add('open');
    }
  }

  ngAfterViewInit() {
    const gesture = this.gestureCtrl.create({
      el: this.hostRef.nativeElement,
      gestureName: 'swipe',
      direction: 'y',
      onStart: ev => {
        this.hostRef.nativeElement.classList.add('touching');
      },
      onMove: ev => this.swipe(ev.deltaY),
      onEnd: ev => {
        this.hostRef.nativeElement.classList.remove('touching');
      },
    });
    gesture.enable();
  }
}
