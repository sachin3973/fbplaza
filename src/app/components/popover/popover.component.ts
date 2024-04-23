import { Component, OnInit } from '@angular/core';
import { AppdataService } from 'src/app/services/appdata.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {
  discountItems: any[];

  constructor(private dataService: AppdataService) { }

  ngOnInit() {
    this.discountItems = this.dataService.globalvars.get('discountOptions');
  }

}
