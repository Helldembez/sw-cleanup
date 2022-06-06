import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RunesRoutingModule } from './runes-routing.module';

import { RunesComponent } from './runes.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [RunesComponent],
  imports: [CommonModule, SharedModule, RunesRoutingModule]
})
export class RunesModule {}
