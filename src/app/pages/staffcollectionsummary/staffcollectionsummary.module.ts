import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffcollectionsummaryPageRoutingModule } from './staffcollectionsummary-routing.module';

import { StaffcollectionsummaryPage } from './staffcollectionsummary.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffcollectionsummaryPageRoutingModule,
    SharedModule,
  ],
  declarations: [StaffcollectionsummaryPage]
})
export class StaffcollectionsummaryPageModule {}
