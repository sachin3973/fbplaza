import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-headerinvoice',
  templateUrl: './headerinvoice.component.html',
  styleUrls: ['./headerinvoice.component.scss'],
})
export class HeaderinvoiceComponent implements OnInit {
  @Input() title: string;
  @Input() goBackToInvoices: string;
  constructor(private _router: Router) { }


  ngOnInit() { }
  
  gotodashboard() {
    this._router.navigate(['/dashboard']);
  }

}
