import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenedorInventarioComponent } from './mantenedor-inventario.component';

describe('MantenedorInventarioComponent', () => {
  let component: MantenedorInventarioComponent;
  let fixture: ComponentFixture<MantenedorInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MantenedorInventarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenedorInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
