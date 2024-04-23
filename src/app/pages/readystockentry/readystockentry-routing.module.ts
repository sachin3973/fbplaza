import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReadystockentryPage } from './readystockentry.page';

const routes: Routes = [
  {
    path: '',
    component: ReadystockentryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReadystockentryPageRoutingModule {}
