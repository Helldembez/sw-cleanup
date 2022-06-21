import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PresetsRoutingModule } from './presets-routing.module';

import { PresetsComponent } from './presets.component';
import { SharedModule } from '../shared/shared.module';
import { PresetComponent } from './preset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PresetsComponent, PresetComponent],
  imports: [CommonModule, SharedModule, PresetsRoutingModule, FormsModule, ReactiveFormsModule, NgSelectModule]
})
export class PresetsModule { }
