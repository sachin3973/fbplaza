import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartywiseinvoicecardComponent } from './partywiseinvoicecard.component';

describe('PartywiseinvoicecardComponent', () => {
  let component: PartywiseinvoicecardComponent;
  let fixture: ComponentFixture<PartywiseinvoicecardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartywiseinvoicecardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartywiseinvoicecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
