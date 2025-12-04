import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenedorMovilComponent } from './mantenedor-movil.component';

describe('MantenedorMovilComponent', () => {
  let component: MantenedorMovilComponent;
  let fixture: ComponentFixture<MantenedorMovilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MantenedorMovilComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenedorMovilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
