import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { IonAlert } from '@ionic/angular/standalone';
import { AssetsApiService } from 'src/app/_services/api/assets.api.service';

@Component({
  selector: 'app-create-route-collection',
  standalone: true,
  imports: [IonAlert],
  template: `
    @if (isOpen) {
      <ion-alert
        [isOpen]="true"
        header="Create new route collection"
        [buttons]="[{ text: 'Cancel', role: 'cancel' }, { text: 'Save', role: 'save' }]"
        [inputs]="[{ placeholder: 'Enter collection name', attributes: { minLength: 2 }, id: 'name' }]"
        (didDismiss)="setResult($event)"
      />
    }
  `,
  styleUrl: './create-route-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRouteCollectionComponent {
  @Input() isOpen = false
  @Output() isOpenChange = new EventEmitter<boolean>()
  assetsApiService = inject(AssetsApiService)


  setResult(event: any) {
    const { data, role } = event.detail
    if (data) {
      const [name] = Object.values(data.values)
      if (role === 'save' && name) {
        this.assetsApiService.createRouteCollection(name as string).subscribe()
      }
    }
    this.isOpenChange.emit(false)
  }
}
