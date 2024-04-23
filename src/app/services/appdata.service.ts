/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter, Injectable } from "@angular/core";
import {
  AlertController,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { PipaylibService } from "pipaylib";
import { Order } from "pipaylib/domain/order";
import EscPosEncoder from "esc-pos-encoder";
import { Distyretailer } from "pipaylib/domain/distyretailer";
import { formatDate } from "@angular/common";
import { ToWords } from "to-words";
import { Distystaff } from "pipaylib/domain/distystaff";
export interface processinvoice {
  txnid: string;
  retailer: string;
  invoiceno: string;
  paidamount: number;
  paidon: string;
  paymentmode: string;
  bankname: string;
  remark: string;
  scanimageurl: string;
  instrumentref: string;
  chqdate: string;
  collectedby: string;
  retailermobileno: string;
  creditnotereason: string;
  credit: number;
}

@Injectable({
  providedIn: "root",
})
export class AppdataService {
  globalvars = new Map();
  loggedInStaff: Distystaff;
  loggedInStaffChanged: EventEmitter<Distystaff> =
    new EventEmitter<Distystaff>();

  constructor(
    public alertController: AlertController,
    public pipaylib: PipaylibService,
    public toastController: ToastController,
    public loadingController: LoadingController
  ) {}

  public async getBTPrintBuffer(ord: Order) {
    const encoder = new EscPosEncoder();
    const { Font } = require("esc-pos-encoder");
    const printer = encoder.initialize();
    const cartitems = ord.cart.items;
    console.log(cartitems);
    // Define column widths
    const columnWidths = {
      name: 18,
      qty: 6,
      mrp: 7,
      rate: 7,
      amt: 10,
    };

    printer
      .align("center")
      .newline()
      .bold(true)
      .line(this.pipaylib.loginService.loggedindistributor.businessname)
      .bold(false)

      .line(this.pipaylib.loginService.loggedindistributor.addressline1)
      //  .line(this.pipaylib.loginService.loggedindistributor.addressline2)
      //  .line(this.pipaylib.loginService.loggedindistributor.pincode)
      .line(this.pipaylib.loginService.loggedindistributor.mobileno)
      .line(this.pipaylib.loginService.loggedindistributor.emailid)
      .line("GST No :" + this.pipaylib.loginService.loggedindistributor.gstinno)
      .newline();

    const retailerobj = <Distyretailer>(
      await this.pipaylib.dataService.getLiveRetailerForId(
        ord.distyretailerid,
        ord.distributorid
      )
    );
    const retgstinNo = retailerobj.gstinno || "";
    const retaddress = retailerobj.addressline1 || "";
    // Print invoice info
    printer
      .align("center")
      .bold(true)
      .line("---------------- TAX INVOICE ----------------")
      .bold(false)
      .newline()
      .size(0, 0)
      .align("left")
      .line("Salesman Name : " + this.pipaylib.loginService.loggedinstaff.name)
      .line("Customer Name : " + ord.distyretailername)
      .line(retaddress)
      .line("GST No: " + retgstinNo)
      .line("Invoice No: " + ord.billseq)
      .align("right")
      .text("Date: " + formatDate(ord.orderdate, "dd/MM/yyyy", "en"))
      .newline();

    // Print order tab
    printer
      .align("center")
      .text("-".repeat(48))
      .text("Name".padEnd(columnWidths.name))
      .text("Qty".padStart(columnWidths.qty))
      .text("MRP".padStart(columnWidths.mrp))
      .text("Rate".padStart(columnWidths.rate))
      .text("Amt".padStart(columnWidths.amt))
      .newline()
      .text("HSNCode".padEnd(columnWidths.name))
      .text("".padStart(columnWidths.qty))
      .text("".padStart(columnWidths.mrp))
      .text("Disc".padStart(columnWidths.rate))
      .text("".padStart(columnWidths.amt))
      .newline()
      .text("".padEnd(columnWidths.name))
      .text("".padStart(columnWidths.qty))
      .text("".padStart(columnWidths.mrp))
      .text("Tax".padStart(columnWidths.rate))
      .text("".padStart(columnWidths.amt))
      .newline()
      .text("-".repeat(48));

    //Print data rows
    cartitems.forEach((item) => {
      const strnamerray = item.productname.match(/(.{1,18})/g);
      const name1 = strnamerray[0];
      let name2 = "";
      let name3 = "";

      if (strnamerray.length > 1) {
        name2 = strnamerray[1];
        name3 = "HSN:" + item.hsnno;
      } else {
        name2 = "HSN:" + item.hsnno;
      }
      //  if(strnamerray.length > 2) name3 = strnamerray[2];

      if (!item.cess) {
        item.cess = 0;
      }
      if (!item.gst) {
        item.gst = 0;
      }
      if (!item.cgst) {
        item.cgst = 0;
      }
      if (!item.sgst) {
        item.sgst = 0;
      }
      if (!item.igst) {
        item.igst = 0;
      }
      const gst = item.cgst + item.sgst + item.igst + item.cess;
      printer
        .text(name1.padEnd(columnWidths.name))
        .text(item.billedquantity.toFixed(0).padStart(columnWidths.qty))
        .text(item.mrp.toFixed(2).padStart(columnWidths.mrp))
        .text(item.rate.toFixed(2).padStart(columnWidths.rate))
        .text(item.billedamount.toFixed(2).padStart(columnWidths.amt))
        .newline()
        .text(name2.padEnd(columnWidths.name))
        .text("".padStart(columnWidths.qty))
        .text("".padStart(columnWidths.mrp))
        .text(item.disc.toFixed(2).padStart(columnWidths.rate))
        .text("".padStart(columnWidths.amt))
        .newline()
        .text(name3.padEnd(columnWidths.name))
        .text("".padStart(columnWidths.qty))
        .text("".padStart(columnWidths.mrp))
        .text(gst.toFixed(2).padStart(columnWidths.rate))
        .text("".padStart(columnWidths.amt))
        .newline();
    });

    printer
      .text("-".repeat(48))
      .align("right")
      .text("Taxable Amount: " + ord.cart.billedamount.toFixed(2))
      .newline()
      .text("-".repeat(48))
      .align("left")
      .text("GST%")
      //.text('Taxable'.padStart(8))
      .text("CGST".padStart(8))
      .text("SGST".padStart(8))
      .text("IGST".padStart(8))
      .text("CESS".padStart(8))
      .newline()
      .text("-".repeat(48));

    ord.cart.gstbifurcationlist.forEach((txitem) => {
      let cess = 0;
      if (txitem.gstrate == 28) {
        cess = ord.cart.cess;
      }

      if (!cess) {
        cess = 0;
      }
      printer
        .text(txitem.gstrate.toFixed(0).padStart(3))
        //.text(item.taxable.toFixed(2).padStart(8))
        .text(txitem.cgstamount.toFixed(2).padStart(8))
        .text(txitem.sgstamount.toFixed(2).padStart(8))
        .text(txitem.igstamount.toFixed(2).padStart(8))
        .text(cess.toFixed(2).padStart(10))
        .newline();
    });

    const strpayable = "" + ord.cart.payableamount;
    const payableamt = parseFloat(strpayable);
    printer
      .text("-".repeat(48))
      .size(0, 0)
      .align("left")
      .text("Total Payable: ")
      .text(payableamt.toFixed(2).padEnd(9))
      .newline()
      .text("-".repeat(48))
      .align("left")
      .text("Total Saving: " + ord.cart.totaldisc.toFixed(2))
      .newline()
      .text("-".repeat(48));

    // Cut the paper
    const toWords = new ToWords();
    // Print additional details
    printer
      .newline()
      .newline()
      .align("left")
      .size(0, 0)
      .line("Total Invoice Value (In Rupees):  ")
      .line(toWords.convert(payableamt))
      .newline()
      .newline()
      .newline()
      .line("Customer Sign: ___________________")
      .newline()
      .newline()
      .line("Salesman Sign: ___________________")
      .newline()
      .newline()
      //.line('Tcs would be charged and collected on billing value from the customer as per provision of the income tax act 1961')
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut();

    const resultByte = printer.encode();
    console.log("PRINT STRING " + resultByte);
    return resultByte;
  }
  public async displayToast(
    msg: string,
    alerttype: string,
    position?: "top" | "bottom" | "middle"
  ) {
    let stricon;
    let strcssclass;

    if (alerttype === "SUCCESS") {
      stricon = "checkmark-circle";
      strcssclass = "success-toast";
    } else if (alerttype === "FAIL") {
      stricon = "ban";
      strcssclass = "fail-toast";
    } else if (alerttype === "WARNING") {
      stricon = "warning";
      strcssclass = "warning-toast";
    }

    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      cssClass: strcssclass,
      position: position ? position : "bottom",
      buttons: [
        {
          side: "start",
          icon: stricon,
        },
      ],
    });
    toast.present();
  }

  // Simple loader
  simpleLoader(message?) {
    let strmsg = "Loading..";
    if (message) {
      strmsg = message;
    }

    this.loadingController
      .create({
        message: strmsg,
      })
      .then((response) => {
        response.present();
      });
  }

  // Dismiss loader
  dismissLoader() {
    this.loadingController
      .dismiss()
      .then((response) => {
        //console.log('Loader closed!', response);
      })
      .catch((err) => {
        //console.log('Error occured : ', err);
      });
  }

  setLoggedStaff(user: any): void {
    this.loggedInStaff = user;
    localStorage.setItem("loggedInStaff", JSON.stringify(user));
    this.loggedInStaffChanged.emit(user);
  }

  getLoggedInStaff(): any {
    if (!this.loggedInStaff) {
      const storedUser = localStorage.getItem("loggedInStaff");
      this.loggedInStaff = storedUser ? JSON.parse(storedUser) : null;
    }
    return this.loggedInStaff;
  }
}
