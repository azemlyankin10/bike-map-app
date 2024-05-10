import { ComponentFactoryResolver, Injectable, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BottomSheetService {
  subsection = new BehaviorSubject<TemplateRef<any> | null>(null);
  isSubsectionVisible = new BehaviorSubject<boolean>(false);

  setSubSection(template: TemplateRef<any>) {
    this.subsection.next(template);
  }

  toggleSubsection() {
    this.isSubsectionVisible.next(!this.isSubsectionVisible.value);
  }

}
