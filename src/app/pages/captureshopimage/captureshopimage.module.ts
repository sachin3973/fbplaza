import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/components/shared.module';
import { IonicModule } from '@ionic/angular';
import { CaptureshopimagePageRoutingModule } from './captureshopimage-routing.module';
import { CaptureshopimagePage } from './captureshopimage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    CaptureshopimagePageRoutingModule
  ],
  declarations: [CaptureshopimagePage]
})
export class CaptureshopimagePageModule {}
