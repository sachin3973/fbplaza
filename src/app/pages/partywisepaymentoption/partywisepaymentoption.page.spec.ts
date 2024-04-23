import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartywisepaymentoptionPage } from './partywisepaymentoption.page';

describe('PartywisepaymentoptionPage', () => {
  let component: PartywisepaymentoptionPage;
  let fixture: ComponentFixture<PartywisepaymentoptionPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartywisepaymentoptionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartywisepaymentoptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
