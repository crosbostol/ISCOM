import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { inventoryDBModel,inv_proDBModel,otDBModel,itm_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';

@Component({
  selector: 'ot-material-dialog',
  templateUrl: './ot-material-dialog.component.html',
  styleUrls: ['./ot-material-dialog.component.scss']
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
titleAlert : string = "Requerido"
itemOTForm = [{selectedMaterialId: '', ot_id:'', quantity:''}]
public civil_chofer: any =[]
public products: any =[]
public item_OC: any =[]
public conductorName:  string
public movilId: string
@Output() close: EventEmitter<any> = new EventEmitter();


constructor(private apiService : ApiService,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<oTMaterialDialogComponent>,
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




    if(this.data.values){
      this.editing = true;
      this.tit_btn = "Editar";
      //this.fillUp();
    }
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

  get _itemOT(): FormArray {
    return this.formMaterialOt.get('_itemOT') as FormArray;
  }

  additemOtForm(){
    this._itemOT.push(this.formBuilder.group({
      item_id:null,
      ot_id:this.data.values.ot_id,
      quantity:null
    }))
  }

  public selectedOption: string
fillUp(){
  switch (this.data.url) {
    case "mantenedorOt":
      // this.selectedOption = this.data.values.civil_movil_id
      // this.title = "Editando "+ this.data.values.ot_id
      // this.formMaterialOt.controls['selectedMaterialId'].setValue(this.data.values.item_id)
      // this.formMaterialOt.controls['description'].setValue(this.data.values.description)
      // this.formMaterialOt.controls['quantity'].setValue(this.data.values.quantity)


      // luego consumir endpoint para traer los item id
      break;



  }


}

formButtonEvent(){
  console.log(this.formGroup)
  console.log(this.data.values)
  switch (this.data.url) {
      case "mantenedorOt":
        console.log(this.formMaterialOt)
        const currentDate = new Date();
        const formattedDate = moment(currentDate).format('YYYY-MM-DD')
        let formOT: otDBModel = {
          ot_state: this.formGroup.value.ot_state,
          civil_movil_id: this.formGroup.value.civil_movil_id,
          hydraulic_movil_id: this.formGroup.value.hydraulic_movil_id,
          observation: this.formGroup.value.observation,
          started_at: formattedDate,
          ot_id: this.data.values.ot_id
        }


      this.formMaterialOt.value.fields.map((values: any)=>{
        let formOtItem: itm_otDBModel = {
          item_id:values.selectedMaterialId,
          ot_id: this.data.values.ot_id,
          quantity:values.quantity,


        }
        console.log(values);
        const subOTitm = this.apiService.postItmOt(formOtItem)
      .subscribe({
        next: (response) => {subOTitm.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
        error: (error) => console.log(error),
      });})

      break;
  }




}

//Trae los móviles de civil y los nombres de los chóferes
getMovilOc(){
  const id = this.data.inventory
  console.log("🚀 ~ file: mantenedor-inventario.component.ts:35 ~ MantenedorInventarioComponent ~ loadInventario ~ id:", id)

  lastValueFrom(this.apiService.getMovilOc())
  .then(payload =>{

    this.civil_chofer = payload
    this.civil_chofer = Object.values(this.civil_chofer.rows)
  })
  .catch(err => {
    alert("Error al cargar los productos")
    console.error(err)
  });
}


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
getItemOC(){

  lastValueFrom(this.apiService.getItemOC())
  .then(payload =>{

    this.item_OC = payload
    this.item_OC = Object.values(this.item_OC)
    console.log(this.item_OC)
  })
  .catch(err => {
    alert("Error al cargar los PARTIDAS OC")
    console.error(err)
  });
}

// Esto pone el nombre del conductor según el id del movil

NameOfConductor(row: any){

  const Name = this.civil_chofer.find((((name: { movil_id: string; }) => name.movil_id === row)));
  this.conductorName = Name.name
  console.log("🚀 ~ file: form-dialog.component.ts:196 ~ FormDialogComponent ~ NameOfConductor ~ this.conductorName:", this.conductorName)
  this.movilId = row.movil_id


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


totalValue(event: any, index:number){
  this.totalValueItem[index] = this.selectedItemValue[index] * event.target.value

}


}




