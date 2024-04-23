import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateversionPageRoutingModule } from './updateversion-routing.module';

import { UpdateversionPage } from './updateversion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateversionPageRoutingModule
  ],
  declarations: [UpdateversionPage]
})
export class UpdateversionPageModule {}
