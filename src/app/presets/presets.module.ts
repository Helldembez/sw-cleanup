import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PresetsRoutingModule } from './presets-routing.module';

import { PresetsComponent } from './presets.component';
import { SharedModule } from '../shared/shared.module';
import { PresetComponent } from './preset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PresetsComponent, PresetComponent],
  imports: [CommonModule, SharedModule, PresetsRoutingModule, FormsModule, ReactiveFormsModule]
})
export class PresetsModule {}
