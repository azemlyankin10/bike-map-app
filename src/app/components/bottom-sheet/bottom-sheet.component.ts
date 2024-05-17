import { AsyncPipe, CommonModule, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Attribute, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, effect, inject, signal } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { GestureController } from '@ionic/angular';
import { AppStateService } from 'src/app/_services/app-state.service';
import { InsertionPointDirective } from 'src/app/_directives/insertionPointDirective';
import { BottomSheetService } from './bottom-sheet.service';
import { delay, distinctUntilChanged, takeUntil, tap } from 'rxjs';
import { destroyNotifier } from 'src/app/helpers/functions/destroyNotifier';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [NgTemplateOutlet, AsyncPipe],
  template: `
    <div class="additionalSection" #additionalSection>
      <ng-container *ngTemplateOutlet="bottomSheetService.subsection | async" />
    </div>
    <div class="mainSection" #mainSection>
      @if (closeOnSwipe) {
        <button class="button-sheet-up-line" (click)="toggleSheet()"></button>
      }
      <ng-content/>
    </div>
  `,
  styleUrl: './bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent implements AfterViewInit, OnInit {
  private IS_DESTROYED = destroyNotifier()
  @ViewChild('mainSection') mainSection!: ElementRef;
  @ViewChild('additionalSection') additionalSection!: ElementRef;
  hostRef = inject(ElementRef);
  gestureCtrl = inject(GestureController);
  appState = inject(AppStateService);
  bottomSheetService = inject(BottomSheetService);
  @Output() closeSheet = new EventEmitter<void>();
  @Input() closeOnSwipe = true;

  isOpen = signal(false);

  constructor() {
    effect(() => {
      this.isOpen() ? this.hostRef.nativeElement.classList.add('open') : this.hostRef.nativeElement.classList.remove('open');
      if (Capacitor.getPlatform() !== 'web') {
        Haptics.impact({ style: ImpactStyle.Light });
      }
    })
  }

  ngOnInit(): void {
      this.bottomSheetService.isSubsectionVisible.pipe(
        takeUntil(this.IS_DESTROYED),
        distinctUntilChanged(),
        tap(isVisible => {
          if (isVisible) {
            this.additionalSection?.nativeElement.classList.add('isVisible')
          } else {
            this.additionalSection?.nativeElement.classList.remove('open')
          }
        }),
        delay(100)
      ).subscribe(isVisible => {
        if (isVisible) {
          this.additionalSection?.nativeElement.classList.add('open')
        } else {
          this.additionalSection?.nativeElement.classList.remove('isVisible')
        }
      })
  }

  swipe(deltaY: number) {
    if (!this.closeOnSwipe) return;
    if (deltaY < -50) {
      this.open()
    } else if (deltaY > 50) {
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
    this.isOpen.set(true)
  }

  hide() {
    this.isOpen.set(false)
    this.closeSheet.emit()
  }

  ngAfterViewInit() {
    const gesture = this.gestureCtrl.create({
      el: this.mainSection?.nativeElement,
      gestureName: 'swipe',
      direction: 'y',
      onStart: () => {
        this.mainSection?.nativeElement.classList.add('touching');
      },
      onMove: ev => this.swipe(ev.deltaY),
      onEnd: () => {
        this.mainSection?.nativeElement.classList.remove('touching');
      },
    });
    gesture.enable();
  }
}
