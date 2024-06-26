import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartywiseqrcodepagePageRoutingModule } from './partywiseqrcodepage-routing.module';

import { PartywiseqrcodepagePage } from './partywiseqrcodepage.page';
import { SharedModule } from 'src/app/components/shared.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartywiseqrcodepagePageRoutingModule,
    SharedModule,
    NgxQRCodeModule,
  ],
  declarations: [PartywiseqrcodepagePage]
})
export class PartywiseqrcodepagePageModule {}
