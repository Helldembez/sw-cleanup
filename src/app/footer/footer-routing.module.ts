import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FooterComponent } from './footer.component';

const routes: Routes = [
    {
        path: 'footer',
        component: FooterComponent
    }
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FooterRoutingModule { }
