import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { inventoryDBModel,inv_proDBModel,otDBModel,itm_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';
import { oTItemDialogComponent } from '../../formularios/otItemDialog/ot-item-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})



export class FormDialogComponent implements OnInit {
  public filterOptions: any = ['CREADA', 'OBRA CIVIL', 'RETIRO', 'FINALIZADA']
selectedState: any
  tabRouting = 0
  clicked: boolean = false
  message: string = ""
cancelButtonText = "Cancel"
categories: String[]
title: string
formGroup: FormGroup
formItemOt: FormGroup
formInvPro: {}
disablepInput = true
  tit_btn: string;
  editing: boolean;
titleAlert : string = "Requerido"
itemOTForm = [{selectedItemId: '', ot_id:'', quantity:''}]
public civil_chofer: any =[]
public item_OH: any =[]
public item_OC: any =[]
public conductorName:  string
public movilId: string
@Output() close: EventEmitter<any> = new EventEmitter();
@Output() Complete: EventEmitter<any> = new EventEmitter();


constructor(private apiService : ApiService,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<FormDialogComponent>,
  private formBuilder:FormBuilder,
  private dialog: MatDialog,
  private router:Router
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
         this.formItemOt = this.formBuilder.group({
          'selectedItemId':[null, Validators.required],
          'quantity':[null, Validators.required],
          'total':[null, Validators.required],
          'price':[null, Validators.required],
          'description':[null, Validators.required],

          fields: this.formBuilder.array([ this.createField() ])
         })

         this.fields = this.formItemOt.get('fields') as FormArray;

          this.formGroup = this.formBuilder.group({
           'ot_state':[null, Validators.required],
           'direction':[{value: '', disabled:true}, Validators.required],
           'civil_movil_id':[null, Validators.required],
           'hydraulic_movil_id':[null, Validators.required],
           'n_hidraulico':[null, Validators.required],
           'n_civil':[null, Validators.required],
           'observation':[null, Validators.required],
          //  'selectedItemId':[null, Validators.required],
          // 'quantity':[null, Validators.required],

          })
          this.getMovilOc()
          this.getItemOC()
          this.getItemOH()
          break;


    }
    if(this.data.values){
      this.editing = true;
      this.tit_btn = "Editar";
      this.fillUp();
    }
  }

  createField(): FormGroup {
    return this.formBuilder.group({
      selectedItemId: ['', Validators.required],
      description: ['', Validators.required],
      quantity: ['', Validators.required],
      price: ['', Validators.required],
      total: ['', Validators.required],
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
    console.log(this.formItemOt.value);
    console.log(this.formItemOt.value.fields)
    this.formItemOt.value.fields.map(()=>console.log("a"))
  }

  get _itemOT(): FormArray {
    return this.formItemOt.get('_itemOT') as FormArray;
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
    case "mantenedorInventario":
      this.title = "Editando "+ this.data.values.product_name +" de " + this.data.values.inventory_id
        this.formGroup.controls['product_category'].setValue(this.data.values.product_category)
        this.formGroup.controls['product_name'].setValue(this.data.values.product_name)
        this.formGroup.controls['product_unit'].setValue(this.data.values.product_unit)
        this.formGroup.controls['quantity'].setValue(this.data.values.quantity)
      break;
    case "mantenedorOt":
      //this.selectedOption = this.data.values.civil_movil_id
      this.title = "Editando "+ this.data.values.ot_id
      this.selectedState = this.data.values.ot_state
      this.formGroup.controls['direction'].setValue(this.data.values.street + " "+this.data.values.number_street + ", " + this.data.values.commune )
     this.formGroup.controls['civil_movil_id'].setValue(this.data.values.civil_movil_id)
      this.formGroup.controls['hydraulic_movil_id'].setValue(this.data.values.hydraulic_movil_id)
      this.formGroup.controls['n_hidraulico'].setValue(this.data.values.n_hidraulico)
      this.formGroup.controls['n_civil'].setValue(this.data.values.n_civil)
      this.formItemOt.controls['selectedItemId'].setValue(this.data.values.item_id)
      this.formGroup.controls['observation'].setValue(this.data.values.observation)
      this.formItemOt.controls['description'].setValue(this.data.values.description)
      this.formItemOt.controls['quantity'].setValue(this.data.values.quantity)
      this.formItemOt.controls['price'].setValue(this.data.values.price)


      // luego consumir endpoint para traer los item id
      break;



  }


}

formButtonEvent(){
  // console.log(this.formGroup)
  // console.log(this.data.values)
  // console.log(this.formItemOt.value.fields)
this.Complete.emit()
  // switch (this.data.url) {
  //   case "mantenedorInventario":
  //     let formInvPro: inv_proDBModel = {
  //       inventory_id: this.data.values.inventory_id,
  //       product_id: this.data.values.product_id,
  //       quantity: this.formGroup.value.quantity
  //     }

  //      // var formData: any = new FormData();
  //      const sub = this.apiService.putInvPro(formInvPro)
  //        .subscribe({
  //          next: (response) => {sub.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
  //          error: (error) => console.log(error),
  //        });
  //     break;
  //     case "mantenedorOt":
  //       console.log(this.formItemOt)
  //       const currentDate = new Date();
  //       const formattedDate = moment(currentDate).format('YYYY-MM-DD')
  //       let formOT: otDBModel = {
  //         ot_state: this.formGroup.value.ot_state,
  //         civil_movil_id: this.formGroup.value.civil_movil_id,
  //         hydraulic_movil_id: this.formGroup.value.hydraulic_movil_id,
  //         observation: this.formGroup.value.observation,
  //         started_at: formattedDate,
  //         ot_id: this.data.values.ot_id
  //       }


  //     this.formItemOt.value.fields.map((values: any)=>{
  //       let formOtItem: itm_otDBModel = {
  //         item_id:values.selectedItemId,
  //         ot_id: this.data.values.ot_id,
  //         quantity:values.quantity,


  //       }
  //       console.log(values);
  //       const subOTitm = this.apiService.postItmOt(formOtItem)
  //     .subscribe({
  //       next: (response) => {subOTitm.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
  //       error: (error) => console.log(error),
  //     });})

  //     break;
  // }




}

//Trae los móviles de civil y los nombres de los chóferes
getMovilOc(){
  const id = this.data.inventory

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


getItemOH(){

  lastValueFrom(this.apiService.getItemOH())
  .then(payload =>{

    this.item_OH = payload
    this.item_OH = Object.values(this.item_OH)
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
  this.movilId = row.movil_id


}
selectedItemId: string;
selectedItemDescription: string[] = new Array(10).fill('');;
selectedItemValue: number[] = new Array(10).fill(0);;
totalValueItem: number[] = new Array(10).fill(0);;

onItemIdChanged(event: any, index:number ) {
  const selectedItem = this.item_OH.find((((item: { item_id: string; }) =>  item.item_id === event.target.value)));
  console.log("🚀 ~ file: form-dialog.component.ts:289 ~ FormDialogComponent ~ onItemIdChanged ~  const selectedItem:",   selectedItem)

    if (selectedItem) {
      console.log("äa")
    this.selectedItemValue[index] = parseFloat(selectedItem.item_value.replace(/[^0-9.-]+/g,""));
    this.selectedItemDescription[index] = selectedItem.description;

  } else {
    this.selectedItemDescription[index] = '';

  }
}


totalValue(event: any, index:number){
  this.totalValueItem[index] = this.selectedItemValue[index] * event.target.value

}


redirectTo() {
  this.router.navigate(['/partidas-oh']);
}

changeTabIndex(delta: number) {
  const newTabIndex = this.tabRouting + delta;
  if (newTabIndex >= 0 && newTabIndex < 4) {
    this.tabRouting = newTabIndex;
  }
}
}




