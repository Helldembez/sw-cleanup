import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunesRoutingModule } from './runes-routing.module';

import { NgbdSortableHeader, RunesComponent } from './runes.component';
import { SharedModule } from '../shared/shared.module';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [RunesComponent, NgbdSortableHeader],
  imports: [CommonModule, SharedModule, RunesRoutingModule, NgbModule]
})
export class RunesModule {}
