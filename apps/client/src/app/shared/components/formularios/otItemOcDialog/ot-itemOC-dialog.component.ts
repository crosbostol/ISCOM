import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, FormControl } from '@angular/forms';
import { inventoryDBModel, inv_proDBModel, otDBModel, itm_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';
import { FormDialogComponent } from '../../dialogs/formDialog/form-dialog.component';
import { DataSharingService } from 'src/app/core/services/datasharingservice';
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
  titleAlert: string = "Requerido"
  itemOTForm = [{ selectedItemId: '', ot_id: '', quantity: '' }]
  receivedData: any
  public civil_chofer: any = []
  public item_OH: any = []
  public item_OC: any = []
  public itemOCOT: any = []

  public conductorName: string
  public movilId: string
  @Output() close: EventEmitter<any> = new EventEmitter();
  visualizer: boolean;
  isCreating: boolean;


  constructor(private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<oTItemOCDialogComponent>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private formDialog: MatDialogRef<FormDialogComponent>,
    private dataSharingService: DataSharingService

  ) {
    this.dataSharingService.dataEmitter.subscribe(data => {
      this.receivedData = data[0];
      this.isCreating = true
      this.CreatingOt()
      console.log("🚀 ~ file: ot-item-dialog.component.ts:63 ~ oTItemDialogComponent ~ this.receivedData:", this.receivedData)
    });


    if (data) {
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText
      }
    }
    this.dialogRef.updateSize('200vw', '200vw')
  }
  fields: FormArray
  ngOnInit() {
    //console.log(this.data.values)
    switch (this.data.url) {
      case "mantenedorOt":
        this.formOCItemOt = this.formBuilder.group({
          'selectedItemId': [null, Validators.required],
          'quantity': [null, Validators.required],
          'total': [null, Validators.required],
          'price': [null, Validators.required],
          'description': [null, Validators.required],

          fields: this.formBuilder.array([this.createField()])
        })

        this.fields = this.formOCItemOt.get('fields') as FormArray;

        this.getItemOHOT()
        this.getItemOC()
        break;


    }
    if (this.data.values) {
      this.editing = true;
      this.tit_btn = "Editar";
      //this.fillUp();
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
    this.formOCItemOt.value.fields.map(() => console.log("a"))
  }

  get _itemOT(): FormArray {
    return this.formOCItemOt.get('_itemOT') as FormArray;
  }

  additemOtForm() {
    this._itemOT.push(this.formBuilder.group({
      item_id: null,
      ot_id: this.data.values.ot_id,
      quantity: null
    }))
  }

  public selectedOption: string
  formulario = new FormGroup({});

  fillUp() {

    // itera sobre los elementos de ItemOHOT y agrega un FormControl para cada uno
    this.itemOCOT.forEach((item: {
      index: number;
      quantity: string;
      item_value: string; item_id: string; description: string; total_item_value: string
    }) => {
      this.formulario.addControl(item.item_id, new FormControl(''));
      this.formulario.addControl(item.description, new FormControl(''));
      this.formulario.addControl(item.quantity, new FormControl(''));
      this.formulario.addControl(item.item_value, new FormControl(item.item_value));// agregamos el valor aqui porque con setValue no lo encuentra
      this.formulario.addControl(item.total_item_value.toString(), new FormControl("$" + item.total_item_value.toString()));
      // agregamos el valor de total_item_value aqui porque con setValue no lo encuentra

      // Agregar total_item_value como nuevo control al formulario

    });
    console.log(this.formulario)
    // establece el valor predeterminado para cada FormControl
    this.itemOCOT.forEach((item: {
      total_item_value: any;
      item_value: string; item_id: any; description: string; quantity: string
    }) => {

      this.formulario.get(item.item_id)?.setValue(item.item_id);
      this.formulario.get(item.description)?.setValue(item.description);
      this.formulario.get(item.quantity.toString())?.setValue(item.quantity);

    });


  }
  formButtonEvent() {
    //console.log(this.data.values)


    const currentDate = new Date();
    const formattedDate = moment(currentDate).format('YYYY-MM-DD')

    console.log("🚀 ~ file: ot-itemOC-dialog.component.ts:170 ~ oTItemOCDialogComponent ~ formButtonEvent ~ this.formOCItemOt.value.fields[0]:", this.formOCItemOt.value.fields[0])


    if (this.formOCItemOt.value.fields[0].selectedItemId) {
      this.formOCItemOt.value.fields.map((values: any) => {
        let formOtItem: itm_otDBModel = {
          item_id: values.selectedItemId,
          ot_id: this.data.values.ot_id,
          quantity: values.quantity,


        }
        console.log(formOtItem)
        const subOTitm = this.apiService.postItmOt(formOtItem)
          .subscribe({
            next: (response) => { subOTitm.unsubscribe; this.dialog.closeAll(); this.close.emit(); console.log(response) },
            error: (error) => console.log(error),
          });
      })

      this.formDialog.afterClosed().subscribe(() => {
        this.sendata.unsubscribe()
      })
    } else {
      this.formDialog.afterClosed().subscribe(() => {
        this.sendata.unsubscribe()
      })
    }




  }



  CreatingOt() {
    //console.log(this.data.values)


    const currentDate = new Date();
    const formattedDate = moment(currentDate).format('YYYY-MM-DD')

    console.log("🚀 ~ file: ot-itemOC-dialog.component.ts:170 ~ oTItemOCDialogComponent ~ formButtonEvent ~ this.formOCItemOt.value.fields[0]:", this.formOCItemOt.value.fields[0])


    if (this.formOCItemOt.value.fields[0].selectedItemId && this.isCreating) {
      this.formOCItemOt.value.fields.map((values: any) => {
        let formOtItem: itm_otDBModel = {
          item_id: values.selectedItemId,
          ot_id: this.receivedData,
          quantity: values.quantity,


        }
        console.log(formOtItem)
        const subOTitm = this.apiService.postItmOt(formOtItem)
          .subscribe({
            next: (response) => { subOTitm.unsubscribe; this.dialog.closeAll(); this.close.emit(); console.log(response) },
            error: (error) => console.log(error),
          });
      })

      this.formDialog.afterClosed().subscribe(() => {
        this.sendata.unsubscribe()
      })
    } else {
      this.formDialog.afterClosed().subscribe(() => {
        this.sendata.unsubscribe()
      })
    }




  }
  //Trae los móviles de civil y los nombres de los chóferes


  getItemOC() {

    lastValueFrom(this.apiService.getItemOC())
      .then(payload => {

        this.item_OC = payload
        //this.item_OC = Object.values(this.item_OC)
      })
      .catch(err => {
        alert("Error al cargar los PARTIDAS OC")
        console.error(err)
      });
  }


  getItemOHOT() {
    const type: string = 'OBRAS'
    lastValueFrom(this.apiService.getDetailsOtItem(this.data.values.ot_id, type))
      .then(payload => {

        this.itemOCOT = payload
        //this.itemOCOT = Object.values(this.itemOCOT)

        if (this.itemOCOT) {
          this.visualizer = true;
          this.tit_btn = "Editar";
          this.itemOCOT = this.itemOCOT.map((item: any) => ({
            ...item,
            total_item_value: item.quantity * parseFloat(item.item_value.replace("$", ""))
          }));
          this.fillUp()
        } else {
          this.visualizer = false;
        }
      })
      .catch(err => {
        alert("Error al cargar los PRODUCTOS OH")
        console.error(err)
      });



  }


  selectedItemId: string;
  selectedItemDescription: string[] = new Array(10).fill('');;
  selectedItemValue: number[] = new Array(10).fill(0);;
  totalValueItem: number[] = new Array(10).fill(0);;

  onItemIdChanged(event: any, index: number) {
    console.table(this.item_OC)
    const selectedItem = this.item_OC.find((((item: { item_id: string; }) => item.item_id === event.target.value)));
    console.log("🚀 ~ file: form-dialog.component.ts:289 ~ FormDialogComponent ~ onItemIdChanged ~  const selectedItem:", selectedItem)

    if (selectedItem) {
      console.log("äa")
      this.selectedItemValue[index] = parseFloat(selectedItem.item_value.replace(/[^0-9.-]+/g, ""));
      this.selectedItemDescription[index] = selectedItem.description;

    } else {
      this.selectedItemDescription[index] = '';

    }
  }


  totalValue(event: any, index: number) {
    this.totalValueItem[index] = this.selectedItemValue[index] * event.target.value

  }
  sendata = this.formDialog.componentInstance.Complete.subscribe(() => { this.formButtonEvent() })

}




