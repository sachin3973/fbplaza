import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RequisitionPageRoutingModule } from "./requisition-routing.module";
import { RequisitionPage } from "./requisition.page";
import { SharedModule } from "src/app/components/shared.module";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequisitionPageRoutingModule,
    SharedModule,
    GooglePlaceModule,
  ],
  declarations: [RequisitionPage],
})
export class RequisitionPageModule {}
