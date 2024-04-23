import { Component, OnInit } from '@angular/core';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from 'src/app/services/appdata.service';
import { StatusBar } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-updateversion',
  templateUrl: './updateversion.page.html',
  styleUrls: ['./updateversion.page.scss'],
})
export class UpdateversionPage implements OnInit {

  constructor(private pipaylib: PipaylibService,private dataService: AppdataService,private _router: Router) { }
  webapp;
  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
        this._router.navigate(['/']);            
    }
    //console.log('update')
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: '#033584' });
      this.webapp = false;
    }
    else{this.webapp = true}
  }

  upgrade() {    
    window.location.href= "https://play.google.com/store/apps/details?id=in.pipayments.staffapp";
  }

  refresh() {
    window.location.reload();
  }
}
