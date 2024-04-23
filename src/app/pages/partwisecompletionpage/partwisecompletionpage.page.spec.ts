import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartwisecompletionpagePage } from './partwisecompletionpage.page';

describe('PartwisecompletionpagePage', () => {
  let component: PartwisecompletionpagePage;
  let fixture: ComponentFixture<PartwisecompletionpagePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartwisecompletionpagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartwisecompletionpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
