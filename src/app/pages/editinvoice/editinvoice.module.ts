import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditinvoicePageRoutingModule } from './editinvoice-routing.module';

import { EditinvoicePage } from './editinvoice.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    EditinvoicePageRoutingModule
  ],
  declarations: [EditinvoicePage]
})
export class EditinvoicePageModule {}
