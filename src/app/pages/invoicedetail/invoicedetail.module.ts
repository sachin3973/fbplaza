import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { InvoicedetailPageRoutingModule } from './invoicedetail-routing.module';
import { InvoicedetailPage } from './invoicedetail.page';
import { SharedModule } from 'src/app/components/shared.module';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    InvoicedetailPageRoutingModule,
  ],
  providers: [LaunchNavigator],
  declarations: [InvoicedetailPage],
})
export class InvoicedetailPageModule {}
