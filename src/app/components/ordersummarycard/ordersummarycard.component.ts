import { Component, Input, OnInit } from '@angular/core';
import { PipaylibService } from 'pipaylib';

@Component({
  selector: 'app-ordersummarycard',
  templateUrl: './ordersummarycard.component.html',
  styleUrls: ['./ordersummarycard.component.scss'],
})
export class OrdersummarycardComponent implements OnInit {

  @Input() summaries: any[];

  constructor(private pipaylib: PipaylibService) { }

  ngOnInit() {
  }

}
