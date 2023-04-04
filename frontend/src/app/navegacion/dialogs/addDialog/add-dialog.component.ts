import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule, FormsModule } from '@angular/forms';
import { inventoryDBModel,inv_proDBModel, productDBModel } from 'src/model/transfer-objects';


@Component({
  selector: 'app-add-dialog',
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss']
})



export class AddDialogComponent implements OnInit {
  clicked: boolean = false
  message: string = ""
cancelButtonText = "Cancel"
categories: String[]
title: string
formGroup: FormGroup
formInvPro: {}
disablepInput = true
  tit_btn: string;
  editing: boolean;
titleAlert : string = "Requerido"
form: FormGroup;

@Output() close: EventEmitter<any> = new EventEmitter();
constructor(private apiService : ApiService,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<AddDialogComponent>,
  private formBuilder:FormBuilder,
  private dialog: MatDialog
   )

  {
    if(data){
      this.message = data.message || this.message;
      if (data.buttonText){
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText
      }
    }
    this.dialogRef.updateSize('100vw','100vw')
  }

  ngOnInit(){
    console.log(this.data.values)
    switch (this.data.url) {
      case "mantenedorInventario":
         this.formGroup = this.formBuilder.group({
          'product_category': [null, Validators.required],
          'product_name': [null, Validators.required],
          'product_unit':[null, Validators.required]

         })
        break;
    }
  }



formButtonEvent(){
  console.log(this.formGroup)
switch (this.data.url) {
  case "mantenedorInventario":
    let Product: productDBModel = {
      product_category: this.formGroup.value.product_category,
      product_name: this.formGroup.value.product_name,
      product_unit: this.formGroup.value.product_unit
     }
     const sub = this.apiService.postProduct(Product)
      .subscribe({
        next: (response) => { sub.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
        error: (error) => console.log(error),
      });
    break;


}



  //  // var formData: any = new FormData();




}





submitForm() {
  var formData: any = new FormData();
  formData.append('inventory_id', this.form.get('inventory_id')!.value);
  console.table(this.form)
  this.apiService.postInventory(this.form.value)
    .subscribe({
      next: (response) => console.log(response),
      error: (error) => console.log(error),
    });
}




}




