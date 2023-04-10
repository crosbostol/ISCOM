import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule, FormsModule } from '@angular/forms';
import { inventoryDBModel,inv_proDBModel } from 'src/model/transfer-objects';


@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})



export class FormDialogComponent implements OnInit {
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

@Output() close: EventEmitter<any> = new EventEmitter();

constructor(private apiService : ApiService,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<FormDialogComponent>,
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
    this.dialogRef.updateSize('200vw','200vw')
  }

  ngOnInit(){
    console.log(this.data.values)
    switch (this.data.url) {
      case "mantenedorInventario":
         this.formGroup = this.formBuilder.group({
          'product_category': [{value: '', disabled:true}, Validators.required],
          'product_name': [{value: '', disabled:true}, Validators.required],
          'product_unit':[{value: '', disabled:true}, Validators.required],
          'quantity': [null, Validators.required]
         })
        break;
         case "mantenedorOt":
          this.formGroup = this.formBuilder.group({
           'ot_state':[null, Validators.required],
           'direction':[null, Validators.required],
           'civil_movil_id':[null, Validators.required],
           'hydraulic_movil_id':[null, Validators.required],
           'n_hidraulico':[null, Validators.required],
           'n_civil':[null, Validators.required],
          })
          break;


    }
    if(this.data.values){
      this.editing = true;
      this.tit_btn = "Editar";
      this.fillUp();
    }
  }

fillUp(){
  switch (this.data.url) {
    case "mantenedorInventario":
      this.title = "Editando "+ this.data.values.product_name +" de " + this.data.values.inventory_id
        this.formGroup.controls['product_category'].setValue(this.data.values.product_category)
        this.formGroup.controls['product_name'].setValue(this.data.values.product_name)
        this.formGroup.controls['product_unit'].setValue(this.data.values.product_unit)
        this.formGroup.controls['quantity'].setValue(this.data.values.quantity)
      break;
    case "mantenedorOt":
      this.title = "Editando "+ this.data.values.ot_id
      this.formGroup.controls['ot_state'].setValue(this.data.values.ot_state)
      this.formGroup.controls['direction'].setValue(this.data.values.street + " "+this.data.values.number_street + ", " + this.data.values.commune )
      this.formGroup.controls['civil_movil_id'].setValue(this.data.values.civil_movil_id)
      this.formGroup.controls['hydraulic_movil_id'].setValue(this.data.values.hydraulic_movil_id)
      this.formGroup.controls['n_hidraulico'].setValue(this.data.values.n_hidraulico)
      this.formGroup.controls['n_civil'].setValue(this.data.values.n_civil)


      break;



  }


}

formButtonEvent(){
  console.log(this.formGroup)
  console.log(this.data.values)

  let formInvPro: inv_proDBModel = {
    inventory_id: this.data.values.inventory_id,
    product_id: this.data.values.product_id,
    quantity: this.formGroup.value.quantity
  }


   // var formData: any = new FormData();
   const sub = this.apiService.putInvPro(formInvPro)
     .subscribe({
       next: (response) => {sub.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
       error: (error) => console.log(error),
     });



}





}




