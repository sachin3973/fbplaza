import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PaymentdocketPageRoutingModule } from './paymentdocket-routing.module';
import { PaymentdocketPage } from './paymentdocket.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentdocketPageRoutingModule,
    SharedModule,  
    Ng2SearchPipeModule
  ],
  declarations: [PaymentdocketPage]
})
export class PaymentdocketPageModule {}
