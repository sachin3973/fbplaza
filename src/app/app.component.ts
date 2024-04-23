import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { AlertController, Platform } from '@ionic/angular';
import { Keyboard  } from '@capacitor/keyboard';
import { Router } from '@angular/router';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
  user: string;
  constructor(private platform: Platform, private router: Router, private dataService: AppdataService, private alertController: AlertController) {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: '#033584' });
    }
  }
  
  ngOnInit() {
    if (this.platform.is('capacitor')) {
      Keyboard.setScroll({ isDisabled: true });
    }
    this.user = this.dataService.getLoggedInStaff().name;
  }

  goToOrderReport() {
    this.router.navigate(['/orderreport']);
  }

  async logout() {
    const headerstr = 'Logout';
    const messagestr = 'Do you want to signout from your account?';
    const isconfirmed = await this.confirmDialog(
      headerstr,
      messagestr,
      'Logout'
    );
    if (isconfirmed) {
      localStorage.removeItem('pipaystaff');          
      this.router.navigate(['/']);
    }
  }

  async confirmDialog(headerstr, messagestr, buttonstr) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-alert',
      header: headerstr,
      message: messagestr,
      mode: 'ios',
      buttons: [
        {
          cssClass: 'alertButtonN',
          text: 'Cancel',
          role: 'Cancel',
        },
        {
          cssClass: 'alertButtonY',
          text: buttonstr,
          role: 'Okay',
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'Okay') {
      return true;
    } else {
      return false;
    }
  }
}
