import { ComponentFixture, TestBed } from '@angular/core/testing';

import { oTItemOCDialogComponent } from './ot-itemOC-dialog.component';

describe('FormDialogComponent', () => {
  let component: oTItemOCDialogComponent;
  let fixture: ComponentFixture<oTItemOCDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ oTItemOCDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(oTItemOCDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
