import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadchequePageRoutingModule } from './uploadcheque-routing.module';

import { UploadchequePage } from './uploadcheque.page';
import { SharedModule } from 'src/app/components/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    UploadchequePageRoutingModule
  ],
  declarations: [UploadchequePage]
})
export class UploadchequePageModule {}
