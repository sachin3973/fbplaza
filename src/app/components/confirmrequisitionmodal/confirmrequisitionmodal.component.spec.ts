import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConfirmrequisitionmodalComponent } from './confirmrequisitionmodal.component';

describe('ConfirmrequisitionmodalComponent', () => {
  let component: ConfirmrequisitionmodalComponent;
  let fixture: ComponentFixture<ConfirmrequisitionmodalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmrequisitionmodalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmrequisitionmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
