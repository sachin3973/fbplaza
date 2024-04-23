import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "cash",
    loadChildren: () =>
      import("./pages/cash/cash.module").then((m) => m.CashPageModule),
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadChildren: () =>
      import("./pages/login/login.module").then((m) => m.LoginPageModule),
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./pages/dashboard/dashboard.module").then(
        (m) => m.DashboardPageModule
      ),
  },
  {
    path: "deliveryonly",
    loadChildren: () =>
      import("./pages/deliveryonly/deliveryonly.module").then(
        (m) => m.DeliveryonlyPageModule
      ),
  },
  {
    path: "invoices",
    loadChildren: () =>
      import("./pages/invoices/invoices.module").then(
        (m) => m.InvoicesPageModule
      ),
  },
  {
    path: "invoicedetail",
    loadChildren: () =>
      import("./pages/invoicedetail/invoicedetail.module").then(
        (m) => m.InvoicedetailPageModule
      ),
  },
  {
    path: "editinvoice",
    loadChildren: () =>
      import("./pages/editinvoice/editinvoice.module").then(
        (m) => m.EditinvoicePageModule
      ),
  },
  {
    path: "paymentmode",
    loadChildren: () =>
      import("./pages/paymentmode/paymentmode.module").then(
        (m) => m.PaymentmodePageModule
      ),
  },
  {
    path: "paymentreceipt",
    loadChildren: () =>
      import("./pages/paymentreceipt/paymentreceipt.module").then(
        (m) => m.PaymentreceiptPageModule
      ),
  },
  {
    path: "docketreceipt",
    loadChildren: () =>
      import("./pages/paymentreceipt/paymentreceipt.module").then(
        (m) => m.PaymentreceiptPageModule
      ),
  },
  {
    path: "notifications",
    loadChildren: () =>
      import("./pages/notifications/notifications.module").then(
        (m) => m.NotificationsPageModule
      ),
  },
  {
    path: "uploadinvoice",
    loadChildren: () =>
      import("./pages/uploadinvoice/uploadinvoice.module").then(
        (m) => m.UploadinvoicePageModule
      ),
  },
  {
    path: "upi",
    loadChildren: () =>
      import("./pages/upi/upi.module").then((m) => m.UpiPageModule),
  },
  {
    path: "myaccount",
    loadChildren: () =>
      import("./pages/myaccount/myaccount.module").then(
        (m) => m.MyaccountPageModule
      ),
  },
  {
    path: "qrcodepage",
    loadChildren: () =>
      import("./pages/qrcodepage/qrcodepage.module").then(
        (m) => m.QrcodepagePageModule
      ),
  },
  {
    path: "imagepreview",
    loadChildren: () =>
      import("./pages/imagepreview/imagepreview.module").then(
        (m) => m.ImagepreviewPageModule
      ),
  },
  {
    path: "vehiclerecosummary",
    loadChildren: () =>
      import("./pages/vehiclerecosummary/vehiclerecosummary.module").then(
        (m) => m.VehiclerecosummaryPageModule
      ),
  },
  {
    path: "captureshopimage",
    loadChildren: () =>
      import("./pages/captureshopimage/captureshopimage.module").then(
        (m) => m.CaptureshopimagePageModule
      ),
  },
  {
    path: "updateversion",
    loadChildren: () =>
      import("./pages/updateversion/updateversion.module").then(
        (m) => m.UpdateversionPageModule
      ),
  },
  {
    path: "readystockentry",
    loadChildren: () =>
      import("./pages/readystockentry/readystockentry.module").then(
        (m) => m.ReadystockentryPageModule
      ),
  },
  {
    path: "processreadystock",
    loadChildren: () =>
      import("./pages/processreadystock/processreadystock.module").then(
        (m) => m.ProcessreadystockPageModule
      ),
  },
  {
    path: "completereadystock",
    loadChildren: () =>
      import("./pages/completereadystock/completereadystock.module").then(
        (m) => m.CompletereadystockPageModule
      ),
  },
  {
    path: "paymentdocket",
    loadChildren: () =>
      import("./pages/paymentdocket/paymentdocket.module").then(
        (m) => m.PaymentdocketPageModule
      ),
  },
  {
    path: "qrdocket",
    loadChildren: () =>
      import("./pages/qrdocket/qrdocket.module").then(
        (m) => m.QrdocketPageModule
      ),
  },
  {
    path: "uploaddocket",
    loadChildren: () =>
      import("./pages/uploaddocket/uploaddocket.module").then(
        (m) => m.UploaddocketPageModule
      ),
  },
  {
    path: "staffcollectionsummary",
    loadChildren: () =>
      import(
        "./pages/staffcollectionsummary/staffcollectionsummary.module"
      ).then((m) => m.StaffcollectionsummaryPageModule),
  },
  {
    path: "uploadcheque",
    loadChildren: () =>
      import("./pages/uploadcheque/uploadcheque.module").then(
        (m) => m.UploadchequePageModule
      ),
  },
  {
    path: "requisition",
    loadChildren: () =>
      import("./pages/requisition/requisition.module").then(
        (m) => m.RequisitionPageModule
      ),
  },
  {
    path: "orderreport",
    loadChildren: () =>
      import("./pages/orderreport/orderreport.module").then(
        (m) => m.OrderreportPageModule
      ),
  },
  {
    path: "partywisepaymentoption",
    loadChildren: () =>
      import(
        "./pages/partywisepaymentoption/partywisepaymentoption.module"
      ).then((m) => m.PartywisepaymentoptionPageModule),
  },
  {
    path: "partywiseqrcodepage",
    loadChildren: () =>
      import("./pages/partywiseqrcodepage/partywiseqrcodepage.module").then(
        (m) => m.PartywiseqrcodepagePageModule
      ),
  },
  {
    path: "partwisecompletionpage",
    loadChildren: () =>
      import(
        "./pages/partwisecompletionpage/partwisecompletionpage.module"
      ).then((m) => m.PartwisecompletionpagePageModule),
  },
  {
    path: "ordersummary",
    loadChildren: () =>
      import("./pages/ordersummary/ordersummary.module").then(
        (m) => m.OrdersummaryPageModule
      ),
  },
  {
    path: "pendingdeliveryreport",
    loadChildren: () =>
      import("./pages/pendingdeliveryreport/pendingdeliveryreport.module").then(
        (m) => m.PendingdeliveryreportPageModule
      ),
  },
  {
    path: "pipaypayment",
    loadChildren: () =>
      import("./pages/pipaypayment/pipaypayment.module").then(
        (m) => m.PipaypaymentPageModule
      ),
  },
  {
    path: "blprinter",
    loadChildren: () =>
      import("./pages/blprinter/blprinter.module").then(
        (m) => m.BlprinterPageModule
      ),
  },
  {
    path: "ledger",
    loadChildren: () =>
      import("./pages/ledger/ledger.module").then((m) => m.LedgerPageModule),
  },  {
    path: 'paymentsummary',
    loadChildren: () => import('./pages/paymentsummary/paymentsummary.module').then( m => m.PaymentsummaryPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
