import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionsRoutingModule } from './options-routing.module';

import { OptionsComponent } from './options.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OptionsComponent],
  imports: [CommonModule, SharedModule, OptionsRoutingModule, FormsModule, ReactiveFormsModule]
})
export class OptionsModule {}
