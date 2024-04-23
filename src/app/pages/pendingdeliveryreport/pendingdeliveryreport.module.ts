import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingdeliveryreportPageRoutingModule } from './pendingdeliveryreport-routing.module';
import { SharedModule } from 'src/app/components/shared.module';
import { PendingdeliveryreportPage } from './pendingdeliveryreport.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingdeliveryreportPageRoutingModule,
    SharedModule
  ],
  declarations: [PendingdeliveryreportPage]
})
export class PendingdeliveryreportPageModule {}
