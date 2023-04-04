import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenedorOtComponent } from './mantenedor-ot.component';

describe('MantenedorOtComponent', () => {
  let component: MantenedorOtComponent;
  let fixture: ComponentFixture<MantenedorOtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MantenedorOtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenedorOtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
