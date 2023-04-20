import { ComponentFixture, TestBed } from '@angular/core/testing';

import { oTMaterialDialogComponent } from './ot-material-dialog.component';

describe('FormDialogComponent', () => {
  let component: oTMaterialDialogComponent
;
  let fixture: ComponentFixture<oTMaterialDialogComponent
>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ oTMaterialDialogComponent
     ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(oTMaterialDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
