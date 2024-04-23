import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadinvoicePageRoutingModule } from './uploadinvoice-routing.module';

import { UploadinvoicePage } from './uploadinvoice.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    UploadinvoicePageRoutingModule
  ],
  declarations: [UploadinvoicePage]
})
export class UploadinvoicePageModule {}
