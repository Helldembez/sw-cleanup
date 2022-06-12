import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunesRoutingModule } from './runes-routing.module';

import { RunesComponent } from './runes.component';
import { SharedModule } from '../shared/shared.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbdSortableHeader } from './sortable.directive';

@NgModule({
  declarations: [RunesComponent, NgbdSortableHeader],
  imports: [CommonModule, SharedModule, RunesRoutingModule, NgbModule, FormsModule, ReactiveFormsModule]
})
export class RunesModule {}
