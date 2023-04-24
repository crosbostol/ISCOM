import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { inventoryDBModel,inv_proDBModel,otDBModel,itm_otDBModel,pro_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';
import { FormDialogComponent } from '../../dialogs/formDialog/form-dialog.component';
@Component({
  selector: 'ot-material-dialog',
  templateUrl: './ot-material-dialog.component.html',
  styleUrls: ['./ot-material-dialog.component.scss'],


})



export class oTMaterialDialogComponent implements OnInit {
  clicked: boolean = false
  message: string = ""
cancelButtonText = "Cancel"
categories: String[]
title: string
formGroup: FormGroup
formMaterialOt: FormGroup
formInvPro: {}
disablepInput = true
  tit_btn: string;
  editing: boolean;
  visualizer: boolean
titleAlert : string = "Requerido"
public civil_chofer: any =[]
public products: any =[]
public productsOT: any =[]
public item_OC: any =[]
public conductorName:  string
public movilId: string
@Output() close: EventEmitter<any> = new EventEmitter();
@Output() tabChanged = new EventEmitter<number>();


constructor(private apiService : ApiService,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<oTMaterialDialogComponent>,
  private formBuilder:FormBuilder,
  private dialog: MatDialog,
  private formDialog: MatDialogRef<FormDialogComponent>
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
fields: FormArray



  ngOnInit(){

         this.formMaterialOt = this.formBuilder.group({
          'selectedMaterialId':[null, Validators.required],
          'quantity':[null, Validators.required],
          'description':[null, Validators.required],

          fields: this.formBuilder.array([ this.createField() ])
         })

         this.fields = this.formMaterialOt.get('fields') as FormArray;

          //this.getItemOC()
          this.getProductsOH()
          this.getProductsOT()




    if(this.data.values){
      this.visualizer = true;
      this.tit_btn = "Editar";
      //this.fillUp();
    }
  }
  changeTabIndex(index: number) {
    this.tabChanged.emit(index);
  }
  createField(): FormGroup {
    return this.formBuilder.group({
      selectedMaterialId: ['', Validators.required],
      description: ['', Validators.required],
      quantity: ['', Validators.required],
  });
  }
  addField(): void {
    console.log("a")
    this.fields.push(this.createField());
  }
  removeField(index: number): void {
    this.fields.removeAt(index);
  }
  onSubmit(): void {
    console.log(this.formMaterialOt.value);
    console.log(this.formMaterialOt.value.fields)
    this.formMaterialOt.value.fields.map(()=>console.log("a"))
  }
  public selectedOption: string
fillUp(){


      // this.selectedOption = this.data.values.civil_movil_id
      // this.title = "Editando "+ this.data.values.ot_id
      this.formMaterialOt.controls['selectedMaterialId'].setValue(this.data.values.product_id)
      // this.formMaterialOt.controls['description'].setValue(this.data.values.description)
      // this.formMaterialOt.controls['quantity'].setValue(this.data.values.quantity)


      // luego consumir endpoint para traer los item id

}

formButtonEvent(){
      this.formMaterialOt.value.fields.map((values: any)=>{
        console.warn(values)
        let formOtItem: pro_otDBModel = {
          ot_id: this.data.values.ot_id,
          product_id:values.selectedMaterialId,
          quantity:values.quantity,
          inventory_id: "INV-"+this.data.values.hydraulic_movil_id.replace("-","")


        }
        console.warn(formOtItem);
        const subOTitm = this.apiService.postMatOt(formOtItem)
      .subscribe({
        next: (response) => {subOTitm.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
        error: (error) => console.log(error),
      });
    }
      )

      this.formDialog.afterClosed().subscribe(()=>{
        this.sendata.unsubscribe()
      })



}

//Trae los móviles de civil y los nombres de los chóferes


getProductsOH(){

  lastValueFrom(this.apiService.getProductsOh())
  .then(payload =>{

    this.products = payload
    this.products = Object.values(this.products)
  })
  .catch(err => {
    alert("Error al cargar los PARTIDAS OH")
    console.error(err)
  });
}

getProductsOT(){

  lastValueFrom(this.apiService.getDetailsOtProduct(this.data.values.ot_id))
  .then(payload =>{

    this.productsOT = payload
    this.productsOT = Object.values(this.productsOT )
    console.log("🚀 ~ file: ot-material-dialog.component.ts:177 ~ oTMaterialDialogComponent ~ getProductsOT ~  this.products:",  this.productsOT)
  })
  .catch(err => {
    alert("Error al cargar los PARTIDAS OH")
    console.error(err)
  });
}


selectedMaterialId: string;
selectedItemDescription: string[] = new Array(10).fill('');;
selectedItemValue: number[] = new Array(10).fill(0);;
totalValueItem: number[] = new Array(10).fill(0);;

onItemIdChanged(event: any, index: number) {
  console.warn(this.products);
  const selectedItem = this.products.find((item: { product_id: number }) => item.product_id == event.target.value);
  console.log("🚀 ~ file: ot-material-dialog.component.ts:241 ~ oTMaterialDialogComponent ~ onItemIdChanged ~ selectedItem:", selectedItem)

  if (selectedItem) {
    console.log("a")

    this.selectedItemDescription[index] = selectedItem.product_name;
  } else {
    console.log("bb")
    this.selectedItemDescription[index] = '';
  }
}
sendata = this.formDialog.componentInstance.Complete.subscribe(()=>
{this.formButtonEvent()})

}




