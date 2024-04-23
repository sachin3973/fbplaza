import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LedgerPageRoutingModule } from './ledger-routing.module';

import { LedgerPage } from './ledger.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LedgerPageRoutingModule
  ],
  declarations: [LedgerPage]
})
export class LedgerPageModule {}
