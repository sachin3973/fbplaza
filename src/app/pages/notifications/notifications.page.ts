import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  notificationList = [
    {
      newNotificationStatus: true,
      notificationTime: '03 minutes ago',
      notificationTitle: 'Payment scheduled!',
      notificationDesc: 'Nirav Poojara has scheduled payment via NACH for INV #00001.',
    },
    {
      notificationStatus: false,
      notificationTime: '01 hour ago',
      notificationTitle: 'Invoice updated!',
      notificationDesc: 'INV #15789 has been updated.',
    },
    {
      notificationStatus: false,
      notificationTime: 'Sun, 08:30 pm',
      notificationTitle: 'Payment  scheduled!',
      notificationDesc: 'Kiran Stores has scheduled payment via NACH for INV #12453',
    },
    {
      notificationStatus: false,
      notificationTime: '15 Oct, 08:30 am',
      notificationTitle: 'Invoice updated!',
      notificationDesc: 'INV #12453 has been updated.',
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
