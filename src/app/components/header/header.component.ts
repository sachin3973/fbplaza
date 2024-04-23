import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AppdataService],
})
export class HeaderComponent implements OnInit {
  @Input() title: string;
  @Input() goBackToInvoices: string;
  @Input() goBackToReadyStockEntry: string;
  @Input() goBackToPaymentMode: string;
  @Input() isCartEmpty = true;
  @Input() fromRequisition: boolean;
  @Input() goBackToPartywise: boolean;
  showConfirmationModal: boolean;
  canDismissConfirmationModal: boolean;
  isConfirmed: boolean;

  constructor(private router: Router, private dataService: AppdataService) {}

  ngOnInit() {
    // this.isCartEmpty = this.dataService.globalvars.get('isEmpty');
    console.log(this.fromRequisition);
  }

  goToInvoices() {
    this.router.navigate(['/invoices']);
  }

  goToRequisition() {
    this.router.navigate(['/requisition']);
  }

  goToReadyStockEntry() {
    this.router.navigate(['/readystockentry']);
  }

  goToPartywise() {
    this.router.navigate(['/partywisepaymentoption']);
  }

  closeConfrimationModal() {
    this.canDismissConfirmationModal = true;
    this.showConfirmationModal = false;
    // this.isConfirmed = false;
    // this.dataService.globalvars.set('isEmpty', true)
  }

  goToDashboard() {
    if (!this.isCartEmpty) {
      this.showConfirmationModal = true;
      this.canDismissConfirmationModal = false;
      if (this.isConfirmed) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  goToPaymentMode() {
    this.router.navigate(['/paymentmode']);
  }
}
