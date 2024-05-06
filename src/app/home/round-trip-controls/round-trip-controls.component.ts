import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonRange } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-round-trip-controls',
  standalone: true,
  imports: [CommonModule, IonRange],
  template: `
    <ion-range [value]="value" (ionChange)="valueChanged($event)" [debounce]="700" labelPlacement="stacked" label="Length" [pin]="true">
      <p slot="start" class="tw-mr-3">0</p>
      <p slot="end" class="tw-ml-3">100km</p>
    </ion-range>
  `,
  styleUrl: './round-trip-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTripControlsComponent {
  value = 5

  valueChanged(event: CustomEvent) {
    this.value = event.detail.value

    if (Capacitor.getPlatform() !== 'web') {
      Haptics.impact({ style: ImpactStyle.Medium });
    }
  }
}
