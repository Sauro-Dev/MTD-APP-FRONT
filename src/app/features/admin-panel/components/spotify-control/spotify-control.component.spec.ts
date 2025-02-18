import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyControlComponent } from './spotify-control.component';

describe('SpotifyControlComponent', () => {
  let component: SpotifyControlComponent;
  let fixture: ComponentFixture<SpotifyControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
