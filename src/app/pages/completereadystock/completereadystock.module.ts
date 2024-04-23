import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompletereadystockPageRoutingModule } from './completereadystock-routing.module';

import { CompletereadystockPage } from './completereadystock.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompletereadystockPageRoutingModule
  ],
  declarations: [CompletereadystockPage]
})
export class CompletereadystockPageModule {}
