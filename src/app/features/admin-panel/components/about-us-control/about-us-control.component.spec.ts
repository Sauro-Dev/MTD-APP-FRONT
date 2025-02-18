import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsControlComponent } from './about-us-control.component';

describe('AboutUsControlComponent', () => {
  let component: AboutUsControlComponent;
  let fixture: ComponentFixture<AboutUsControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutUsControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
