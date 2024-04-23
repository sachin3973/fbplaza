import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImagepreviewPageRoutingModule } from './imagepreview-routing.module';
import { SwiperModule } from "swiper/angular";
import { ImagepreviewPage } from './imagepreview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImagepreviewPageRoutingModule,
    SwiperModule
  ],
  declarations: [ImagepreviewPage]
})
export class ImagepreviewPageModule {}
