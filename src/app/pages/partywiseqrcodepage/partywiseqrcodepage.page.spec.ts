import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartywiseqrcodepagePage } from './partywiseqrcodepage.page';

describe('PartywiseqrcodepagePage', () => {
  let component: PartywiseqrcodepagePage;
  let fixture: ComponentFixture<PartywiseqrcodepagePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartywiseqrcodepagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartywiseqrcodepagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
