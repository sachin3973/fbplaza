import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/components/shared.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { TruncatePipe } from './pipe/truncate.pipe';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
// import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    Ng2SearchPipeModule,
    NgxQRCodeModule,
    SharedModule,
    Ng2ImgMaxModule,
  ],
  providers: [BluetoothSerial,AndroidPermissions,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
