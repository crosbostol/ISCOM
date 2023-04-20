import { ComponentFixture, TestBed } from '@angular/core/testing';

import { oTItemDialogComponent } from './ot-item-dialog.component';

describe('FormDialogComponent', () => {
  let component: oTItemDialogComponent;
  let fixture: ComponentFixture<oTItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ oTItemDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(oTItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
