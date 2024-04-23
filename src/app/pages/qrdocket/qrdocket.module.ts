import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrdocketPageRoutingModule } from './qrdocket-routing.module';

import { QrdocketPage } from './qrdocket.page';
import { SharedModule } from 'src/app/components/shared.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrdocketPageRoutingModule,
    SharedModule,
    NgxQRCodeModule,
  ],
  declarations: [QrdocketPage]
})
export class QrdocketPageModule {}
