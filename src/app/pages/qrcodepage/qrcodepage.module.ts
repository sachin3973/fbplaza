import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QrcodepagePageRoutingModule } from './qrcodepage-routing.module';
import { SharedModule } from 'src/app/components/shared.module';
import { QrcodepagePage } from './qrcodepage.page';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    NgxQRCodeModule,
    QrcodepagePageRoutingModule
  ],
  declarations: [QrcodepagePage]
})
export class QrcodepagePageModule {}
