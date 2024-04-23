import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PipaylibService } from 'pipaylib';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-partwisecompletionpage',
  templateUrl: './partwisecompletionpage.page.html',
  styleUrls: ['./partwisecompletionpage.page.scss'],
})
export class PartwisecompletionpagePage implements OnInit {
  processedDate: any;
  user;
  txndate = new Date();

  constructor(private pipaylib: PipaylibService, private dataService: AppdataService, private _router: Router) { }

  ngOnInit() {
    if (!this.pipaylib.loginService.loggedinstaff) {
      this._router.navigate(['/']);
    }
  }

  ionViewWillEnter() {
    this.processedDate = this.dataService.globalvars.get('partywisepaymentObj');
    console.log(this.processedDate)
    this.user = this.dataService.globalvars.get('username');
  }

  goToDashboard() {
    this._router.navigate(['/dashboard'])
  }

}
