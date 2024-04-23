import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Invoice } from 'pipaylib/domain/invoice';

@Component({
  selector: 'app-partywiseinvoicecard',
  templateUrl: './partywiseinvoicecard.component.html',
  styleUrls: ['./partywiseinvoicecard.component.scss'],
})
export class PartywiseinvoicecardComponent implements OnInit {
  @Input()invoice: Invoice;
  @Output()selectedInvoicesEmitter: EventEmitter<{
    selectedInvoice?: Invoice;
    deselectedInvoice?: Invoice;
  }> = new EventEmitter<{
    selectedInvoice?: Invoice;
    deselectedInvoice?: Invoice;
  }>();
  selected: boolean;

  constructor() { }

  ngOnInit() {
  }

  onSelect() {
    if (this.selected) {
      this.selectedInvoicesEmitter.emit({
        selectedInvoice: this.invoice,
      });
    } else {
      this.selectedInvoicesEmitter.emit({
        deselectedInvoice: this.invoice,
      });
    }
  }

}
