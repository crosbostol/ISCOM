import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsociateDialogComponent } from './asociate-dialog.component';

describe('AsociateDialogComponent', () => {
  let component: AsociateDialogComponent;
  let fixture: ComponentFixture<AsociateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsociateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsociateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
