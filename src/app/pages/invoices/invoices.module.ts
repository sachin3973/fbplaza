import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { InvoicesPageRoutingModule } from './invoices-routing.module';

import { InvoicesPage } from './invoices.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    InvoicesPageRoutingModule,
    Ng2SearchPipeModule
  ],
  declarations: [InvoicesPage]
})
export class InvoicesPageModule {}
