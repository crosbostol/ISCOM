import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { inventoryDBModel,inv_proDBModel,otDBModel,itm_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';
import { FormDialogComponent } from '../../dialogs/formDialog/form-dialog.component';
@Component({
  selector: 'ot-itemOC-dialog',
  templateUrl: './ot-itemOC-dialog.component.html',
  styleUrls: ['./ot-itemOC-dialog.component.scss']
})



export class oTItemOCDialogComponent implements OnInit {
  clicked: boolean = false
  message: string = ""
cancelButtonText = "Cancel"
categories: String[]
title: string
formGroup: FormGroup
formOCItemOt: FormGroup
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


constructor(private apiService : ApiService,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<oTItemOCDialogComponent>,
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
    console.log(this.data.values)
    switch (this.data.url) {
         case "mantenedorOt":
         this.formOCItemOt = this.formBuilder.group({
          'selectedItemId':[null, Validators.required],
          'quantity':[null, Validators.required],
          'total':[null, Validators.required],
          'price':[null, Validators.required],
          'description':[null, Validators.required],

          fields: this.formBuilder.array([ this.createField() ])
         })

         this.fields = this.formOCItemOt.get('fields') as FormArray;

          this.getItemOC()
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
    console.log(this.formOCItemOt.value);
    console.log(this.formOCItemOt.value.fields)
    this.formOCItemOt.value.fields.map(()=>console.log("a"))
  }

  get _itemOT(): FormArray {
    return this.formOCItemOt.get('_itemOT') as FormArray;
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
      this.selectedOption = this.data.values.civil_movil_id
      this.title = "Editando "+ this.data.values.ot_id
      this.formGroup.controls['ot_state'].setValue(this.data.values.ot_state)
      this.formGroup.controls['direction'].setValue(this.data.values.street + " "+this.data.values.number_street + ", " + this.data.values.commune )
     this.formGroup.controls['civil_movil_id'].setValue(this.data.values.civil_movil_id)
      this.formGroup.controls['hydraulic_movil_id'].setValue(this.data.values.hydraulic_movil_id)
      this.formGroup.controls['n_hidraulico'].setValue(this.data.values.n_hidraulico)
      this.formGroup.controls['n_civil'].setValue(this.data.values.n_civil)
      this.formOCItemOt.controls['selectedItemId'].setValue(this.data.values.item_id)
      this.formGroup.controls['observation'].setValue(this.data.values.observation)
      this.formOCItemOt.controls['description'].setValue(this.data.values.description)
      this.formOCItemOt.controls['quantity'].setValue(this.data.values.quantity)
      this.formOCItemOt.controls['price'].setValue(this.data.values.price)


      // luego consumir endpoint para traer los item id
      break;



  }


}

formButtonEvent(){
  //console.log(this.data.values)


        console.log(this.formOCItemOt)
        const currentDate = new Date();
        const formattedDate = moment(currentDate).format('YYYY-MM-DD')



      this.formOCItemOt.value.fields.map((values: any)=>{
        let formOtItem: itm_otDBModel = {
          item_id:values.selectedItemId,
          ot_id: this.data.values.ot_id,
          quantity:values.quantity,


        }

        const subOTitm = this.apiService.postItmOt(formOtItem)
      .subscribe({
        next: (response) => {subOTitm.unsubscribe; this.dialog.closeAll();this.close.emit();console.log(response)},
        error: (error) => console.log(error),
      });
    })

    this.formDialog.afterClosed().subscribe(()=>{
      this.sendata.unsubscribe()
    })





}

//Trae los móviles de civil y los nombres de los chóferes


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



selectedItemId: string;
selectedItemDescription: string[] = new Array(10).fill('');;
selectedItemValue: number[] = new Array(10).fill(0);;
totalValueItem: number[] = new Array(10).fill(0);;

onItemIdChanged(event: any, index:number ) {
  const selectedItem = this.item_OC.find((((item: { item_id: string; }) =>  item.item_id === event.target.value)));
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
sendata = this.formDialog.componentInstance.Complete.subscribe(()=>
{this.formButtonEvent()})

}




