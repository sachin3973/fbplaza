import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeliveryonlyPageRoutingModule } from './deliveryonly-routing.module';
import { DeliveryonlyPage } from './deliveryonly.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    DeliveryonlyPageRoutingModule
  ],
  declarations: [DeliveryonlyPage]
})
export class DeliveryonlyPageModule {}
