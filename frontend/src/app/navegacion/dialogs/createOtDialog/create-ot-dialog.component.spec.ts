import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOtDialogComponent } from './create-ot-dialog.component';

describe('CreateOtDialogComponent', () => {
  let component: CreateOtDialogComponent;
  let fixture: ComponentFixture<CreateOtDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOtDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
