import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SwiperOptions } from 'swiper';

// import Swiper core and required modules
import SwiperCore, { Zoom} from 'swiper';
import { SwiperComponent } from 'swiper/angular';
// install Swiper modules
SwiperCore.use([Zoom]);

@Component({
  selector: 'app-imagepreview',
  templateUrl: './imagepreview.page.html',
  styleUrls: ['./imagepreview.page.scss'],
})
export class ImagepreviewPage implements OnInit {

  @ViewChild('swiper') swiper: SwiperComponent;
  @Input() img: string;
  config: SwiperOptions = {
    zoom: true
  };

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  close(){
    this.modalCtrl.dismiss();
  }

  zoom(zoomIn) {
    const zoom = this.swiper.swiperRef.zoom;
    if (zoomIn) {
      zoom.in();
    } else {
      zoom.out();
    }
  }


}
