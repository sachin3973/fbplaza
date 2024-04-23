import { Component, Input, OnInit } from '@angular/core';
import { AppdataService} from '../../services/appdata.service';

@Component({
  selector: 'app-headersummary',
  templateUrl: './headersummary.component.html',
  styleUrls: ['./headersummary.component.scss'],
})
export class HeadersummaryComponent implements OnInit {
  @Input() title: string | undefined;
  showResults = false;
  fromDate: string | any = new Date();
  toDate: string | any = new Date();

  constructor(private dataService: AppdataService) { }

  ngOnInit() {
    this.fromDate = this.reverseDate(this.fromDate.toLocaleDateString());
    this.toDate = this.reverseDate(this.toDate.toLocaleDateString());
  }

  reverseDate(date: string) {
    date = date.split('/').reverse().join('-');
    return date;
  }

  onSearch() {
    this.showResults = true;
    this.dataService.globalvars.set('fromDate', this.fromDate);
    this.dataService.globalvars.set('toDate', this.toDate);
    this.dataService.globalvars.set('showTransactions', this.showResults);
  }

}
