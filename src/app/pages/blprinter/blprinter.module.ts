import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlprinterPageRoutingModule } from './blprinter-routing.module';
import { SharedModule } from 'src/app/components/shared.module';
import { BlprinterPage } from './blprinter.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlprinterPageRoutingModule,
    SharedModule
  ],
  declarations: [BlprinterPage]
})
export class BlprinterPageModule {}
