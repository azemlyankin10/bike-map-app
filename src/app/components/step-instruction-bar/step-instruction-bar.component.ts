import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DistancePipe } from 'src/app/_pipes/distance.pipe';

@Component({
  selector: 'app-step-instruction-bar',
  standalone: true,
  imports: [DistancePipe],
  template: `
    <div class="tw-flex tw-gap-3 tw-items-center tw-w-full">
        <img width="50" class="tw-h-[50px]" src="{{ 'assets/icons/directions/' + step?.type + '.svg' }}" />
      <div class="tw-flex tw-w-full">
       <div>
          <p class="tw-text-sm tw-text-gray-400">{{ step?.name }}</p>
          <p class="tw-text-lg tw-font-bold">{{ step?.instruction }}</p>
       </div>
        <p class="tw-text-sm tw-text-gray-300 tw-ml-auto tw-self-center">{{ step?.remainingDistance | distance }}</p>
      </div>
    </div>
  `,
  styleUrl: './step-instruction-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepInstructionBarComponent {
  @Input({required: true}) step!: IRouteInstructionStep | null;
}


export interface IRouteInstructionStep {
  remainingDistance: number;
  latLng: any[];
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: [number, number];
}
