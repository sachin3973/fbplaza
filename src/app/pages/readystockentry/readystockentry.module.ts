import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { IonicModule } from '@ionic/angular';
import { ReadystockentryPageRoutingModule } from './readystockentry-routing.module';
import { ReadystockentryPage } from './readystockentry.page';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    Ng2SearchPipeModule,
    ReadystockentryPageRoutingModule
  ],
  declarations: [ReadystockentryPage]
})
export class ReadystockentryPageModule {}
