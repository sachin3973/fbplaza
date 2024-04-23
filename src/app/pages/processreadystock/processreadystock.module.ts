import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProcessreadystockPageRoutingModule } from './processreadystock-routing.module';
import { ProcessreadystockPage } from './processreadystock.page';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/components/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxQRCodeModule,
    Ng2SearchPipeModule,
    ProcessreadystockPageRoutingModule,
    SharedModule,
    Ng2SearchPipeModule
  ],
  declarations: [ProcessreadystockPage]
})
export class ProcessreadystockPageModule {}
