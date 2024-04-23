import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartywisepaymentoptionPageRoutingModule } from './partywisepaymentoption-routing.module';
import { SharedModule } from 'src/app/components/shared.module';
import { PartywisepaymentoptionPage } from './partywisepaymentoption.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    PartywisepaymentoptionPageRoutingModule
  ],
  declarations: [PartywisepaymentoptionPage]
})
export class PartywisepaymentoptionPageModule {}
