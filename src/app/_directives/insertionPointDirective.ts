import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appInsertionPoint]',
})
export class InsertionPointDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
