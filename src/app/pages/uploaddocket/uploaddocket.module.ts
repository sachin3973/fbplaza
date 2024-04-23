import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploaddocketPageRoutingModule } from './uploaddocket-routing.module';

import { UploaddocketPage } from './uploaddocket.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    UploaddocketPageRoutingModule
  ],
  declarations: [UploaddocketPage]
})
export class UploaddocketPageModule {}
