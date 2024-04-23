import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { HeaderComponent } from "src/app/components/header/header.component";
import { PaymentmodecardComponent } from "src/app/components/paymentmodecard/paymentmodecard.component";
import { IonvoicecardComponent } from "src/app/components/ionvoicecard/ionvoicecard.component";
import { ComplitionpageComponent } from "src/app/components/complitionpage/complitionpage.component";
import { HeadersummaryComponent } from "src/app/components/headersummary/headersummary.component";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { RoutecardComponent } from "src/app/components/routecard/routecard.component";
import { HeaderinvoiceComponent } from "src/app/components/headerinvoice/headerinvoice.component";
import { CompletiondocketComponent } from "src/app/components/completiondocket/completiondocket.component";
import { RecordsummarycardComponent } from "src/app/components/recordsummarycard/recordsummarycard.component";
import { TruncatePipe } from "src/app/pipe/truncate.pipe";
import { PartywiseinvoicecardComponent } from "src/app/components/partywiseinvoicecard/partywiseinvoicecard.component";
import { PartywisepaymentmodesComponent } from "src/app/components/partywisepaymentmodes/partywisepaymentmodes.component";
import { NgxQRCodeModule } from "@techiediaries/ngx-qrcode";
import { OrdersummarycardComponent } from "./ordersummarycard/ordersummarycard.component";
import { ConfirmrequisitionmodalComponent } from "src/app/components/confirmrequisitionmodal/confirmrequisitionmodal.component";
import { PopoverComponent } from "src/app/components/popover/popover.component";
import { OrderbillComponent } from "src/app/components/orderbill/orderbill.component";
import { DecimalTruncatePipe } from "src/app/pipe/decimaltruncate.pipe";
import { OrderhistorycardComponent } from "src/app/components/orderhistorycard/orderhistorycard.component";

@NgModule({
  declarations: [
    DecimalTruncatePipe,
    TruncatePipe,
    HeaderComponent,
    PaymentmodecardComponent,
    IonvoicecardComponent,
    ComplitionpageComponent,
    HeadersummaryComponent,
    RoutecardComponent,
    HeaderinvoiceComponent,
    CompletiondocketComponent,
    RecordsummarycardComponent,
    OrdersummarycardComponent,
    OrderhistorycardComponent,
    PartywiseinvoicecardComponent,
    PartywisepaymentmodesComponent,
    ConfirmrequisitionmodalComponent,
    PopoverComponent,
    OrderbillComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgxQRCodeModule,
  ],
  /**
   * Exports a set of shared components and pipes that are used throughout the application.
   * These components and pipes are made available to other modules that import this SharedModule.
   */
  exports: [
    HeaderComponent,
    PaymentmodecardComponent,
    IonvoicecardComponent,
    ComplitionpageComponent,
    HeadersummaryComponent,
    RoutecardComponent,
    HeaderinvoiceComponent,
    CompletiondocketComponent,
    RecordsummarycardComponent,
    PartywiseinvoicecardComponent,
    OrdersummarycardComponent,
    PartywisepaymentmodesComponent,
    ConfirmrequisitionmodalComponent,
    PopoverComponent,
    TruncatePipe,
    DecimalTruncatePipe,
    OrderhistorycardComponent,
  ],
})
export class SharedModule {}
