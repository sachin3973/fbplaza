import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { DashboardPageRoutingModule } from "./dashboard-routing.module";
import { DashboardPage } from "./dashboard.page";
import { SharedModule } from "src/app/components/shared.module";
import { TruncatePipe } from "src/app/pipe/truncate.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    DashboardPageRoutingModule,
  ],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}
