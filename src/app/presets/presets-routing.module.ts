import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PresetsComponent } from './presets.component';

const routes: Routes = [
  {
    path: 'presets',
    component: PresetsComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresetsRoutingModule {}
