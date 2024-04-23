import { Component, Input, OnInit } from '@angular/core';
import { PipaylibService } from 'pipaylib';

@Component({
  selector: 'app-orderhistorycard',
  templateUrl: './orderhistorycard.component.html',
  styleUrls: ['./orderhistorycard.component.scss'],
})
export class OrderhistorycardComponent  implements OnInit {
  @Input() records: any[];

  constructor(private pipaylib: PipaylibService) { }

  ngOnInit() { } 


  getCartItems(order: any) {
    let str = "";
    for (let item of order.cart.items) {
      if (order.cart.items.length === 1) {
        str += `${item.billedquantity}${item.uom} x ${item.productname}`
      } else {
        if (item.productid === order.cart.items[order.cart.items.length - 1].productid) {
          str += `${item.billedquantity}${item.uom} x ${item.productname}`
        } else {
          str += `${item.billedquantity}${item.uom} x ${item.productname}, `
        }
      }
    }
    order.items = str;
    return str
  }

}
