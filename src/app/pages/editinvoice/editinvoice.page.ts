/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editinvoice',
  templateUrl: './editinvoice.page.html',
  styleUrls: ['./editinvoice.page.scss'],
})
export class EditinvoicePage implements OnInit {
  @ViewChild('editinvoicemodal') editinvoicemodal: IonModal;
  showTextArea = false;
  showModal = false;
  otherIssue;
  showmodal: boolean;
  canDismiss: boolean;
  optionSelected = false;
  editRequestSent = true;

  optionList = [
    'Quantity not matching with invoice',
    'Damage issue',
    'Payment related issue',
    'Order related issue'
  ];

  constructor(private _router: Router, private toastController: ToastController) { }

  ngOnInit() {
  }

  goToInvoice() {
    this._router.navigate(['/invoices']);
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Invoice edit request sent!',
      duration: 1500,
      position: 'bottom',
      icon: 'checkmark-circle',
      cssClass: 'toast',
      color: 'light'
    });
    this.editRequestSent = false;
    setTimeout(() => {
      this.canDismiss = true;
      this.closemodal();
      this.goToInvoice();
    }, 1500);
    await toast.present();
  }


  ionViewWillEnter = () => {
    this.otherIssue = '';
  };

  openModal() {
    this.canDismiss = false;
    this.showmodal = true;
  }

  closemodal() {
    setTimeout(() => {
      this.showmodal = false;
    }, 100);
  }

  openOtherIssue() {
    this.showTextArea = !this.showTextArea;
    this.optionSelected = false;
  };

  onOptionSelect = () => {
    this.optionSelected = true;
  };

  onOtherIssueChange = () => {
    //console.log('other issue is:', this.otherIssue);
  };

}
