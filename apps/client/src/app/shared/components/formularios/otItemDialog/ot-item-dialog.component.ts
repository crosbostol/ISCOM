import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { interval, take, lastValueFrom, Observable } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, FormControl } from '@angular/forms';
import { inventoryDBModel, inv_proDBModel, otDBModel, itm_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';
import { FormDialogComponent } from '../../dialogs/formDialog/form-dialog.component';
import { DataSharingService } from 'src/app/core/services/datasharingservice';
@Component({
  selector: 'ot-item-dialog',
  templateUrl: './ot-item-dialog.component.html',
  styleUrls: ['./ot-item-dialog.component.scss']
})



export class oTItemDialogComponent implements OnInit {



  receivedData: any;

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
  titleAlert: string = "Requerido"
  itemOTForm = [{ item_id: '', ot_id: '', quantity: '' }]
  public civil_chofer: any = []
  public item_OH: any = []
  public item_OC: any = []
  public conductorName: string
  public movilId: string
  @Output() close: EventEmitter<any> = new EventEmitter();
  public ItemOHOT: any = []
  visualizer: boolean;
  @Input() createdOT$: Observable<string>;
  isCreating: boolean = false;

  constructor(private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<oTItemDialogComponent>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private formDialog: MatDialogRef<FormDialogComponent>,
    private createdOtDialog: MatDialogRef<FormDialogComponent>,
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
    // console.log('Valor recibido desde el padre:', this.createdOT);

    switch (this.data.url) {
      case "mantenedorOt":
        this.formItemOt = this.formBuilder.group({
          'item_id': [null, Validators.required],
          'quantity': [null, Validators.required],
          'total': [null, Validators.required],
          'item_value': [null, Validators.required],
          'description': [null, Validators.required],

          fields: this.formBuilder.array([this.createField()])
        })

        this.fields = this.formItemOt.get('fields') as FormArray;

        this.getItemOH()
        this.getItemOHOT()
        break;


    }
    if (this.data.values) {
      this.editing = true;
      this.tit_btn = "Editar";
      this.fillUp();
    }
  }

  createField(): FormGroup {
    return this.formBuilder.group({
      item_id: ['', Validators.required],
      description: ['', Validators.required],
      quantity: ['', Validators.required],
      item_value: ['', Validators.required],
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
    this.formItemOt.value.fields.map(() => console.log("a"))
  }

  get _itemOT(): FormArray {
    return this.formItemOt.get('_itemOT') as FormArray;
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
    this.ItemOHOT.forEach((item: {
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
    // establece el valor predeterminado para cada FormControl
    this.ItemOHOT.forEach((item: {
      total_item_value: any;
      item_value: string; item_id: any; description: string; quantity: string
    }) => {

      this.formulario.get(item.item_id)?.setValue(item.item_id);
      this.formulario.get(item.description)?.setValue(item.description);
      this.formulario.get(item.quantity.toString())?.setValue(item.quantity);

    });


  }

  formButtonEvent() {
    console.log("-------------------------------")
    console.log(this.receivedData)

    console.log(this.formItemOt)
    const currentDate = new Date();
    const formattedDate = moment(currentDate).format('YYYY-MM-DD')

    console.warn(this.formItemOt.value.fields[0].item_id == "")
    if (this.formItemOt.value.fields[0].item_id) {
      this.formItemOt.value.fields.map((values: any) => {
        let formOtItem: itm_otDBModel = {
          item_id: values.item_id,
          ot_id: this.data.values.ot_id,
          quantity: values.quantity,


        }
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
    console.log("-------------------------------")
    console.log(this.receivedData)

    console.log(this.formItemOt)
    const currentDate = new Date();
    const formattedDate = moment(currentDate).format('YYYY-MM-DD')

    console.warn(this.formItemOt.value.fields[0].item_id == "")
    if (this.formItemOt.value.fields[0].item_id && this.isCreating) {
      this.formItemOt.value.fields.map((values: any) => {
        let formOtItem: itm_otDBModel = {
          item_id: values.item_id,
          ot_id: this.receivedData,
          quantity: values.quantity,


        }
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

  getItemOHOT() {
    const type: string = 'AGUA POTABLE'
    lastValueFrom(this.apiService.getDetailsOtItem(this.data.values.ot_id, type))
      .then(payload => {

        this.ItemOHOT = payload
        //this.ItemOHOT = Object.values(this.ItemOHOT)

        // this.ItemOHOT.map((element: any)=> {
        //    const   totalItem = element.item_value * element.quantity
        //             this.ItemOHOT.push(totalItem)
        // })





        if (this.ItemOHOT) {
          this.visualizer = true;
          this.tit_btn = "Editar";
          this.ItemOHOT = this.ItemOHOT.map((item: any) => ({
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


  getItemOH() {

    lastValueFrom(this.apiService.getItemOH())
      .then(payload => {

        this.item_OH = payload
        //this.item_OH = Object.values(this.item_OH)
      })
      .catch(err => {
        alert("Error al cargar los PARTIDAS OH")
        console.error(err)
      });
  }


  // Esto pone el nombre del conductor según el id del movil

  NameOfConductor(row: any) {

    const Name = this.civil_chofer.find((((name: { movil_id: string; }) => name.movil_id === row)));
    this.conductorName = Name.name
    this.movilId = row.movil_id


  }
  item_id: string;
  selectedItemDescription: string[] = new Array(10).fill('');;
  selectedItemValue: number[] = new Array(10).fill(0);;
  totalValueItem: number[] = new Array(10).fill(0);;

  onItemIdChanged(event: any, index: number) {
    const selectedItem = this.item_OH.find((((item: { item_id: string; }) => item.item_id === event.target.value)));

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



  sendata = this.formDialog.componentInstance.Complete.subscribe(() => {
    console.warn(this.sendata)
    this.createdOT$ = this.createdOtDialog.componentInstance.Complete.asObservable();
    this.createdOT$.subscribe(datos => {
      console.warn('OT ID', datos)
    })

    console.warn(this.receivedData)
    // console.log('Valor recibido desde el padre:', this.createdOT);

    //this.formButtonEvent()
  }
  )




}




