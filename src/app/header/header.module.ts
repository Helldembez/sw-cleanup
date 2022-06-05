import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderRoutingModule } from './header-routing.module';

import { HeaderComponent } from './header.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [HeaderComponent],
    imports: [CommonModule, SharedModule, HeaderRoutingModule]
})
export class HeaderModule { }
