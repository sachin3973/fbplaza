import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartywisepaymentmodesComponent } from './partywisepaymentmodes.component';

describe('PartywisepaymentmodesComponent', () => {
  let component: PartywisepaymentmodesComponent;
  let fixture: ComponentFixture<PartywisepaymentmodesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartywisepaymentmodesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartywisepaymentmodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
