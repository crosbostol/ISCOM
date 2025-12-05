import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../formulario/formulario.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { inventoryDBModel, inv_proDBModel, otDBModel, itm_otDBModel } from 'src/model/transfer-objects';
import * as moment from 'moment';
import { oTItemDialogComponent } from '../../formularios/otItemDialog/ot-item-dialog.component';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/core/services/datasharingservice';

@Component({
  selector: 'create-ot-dialog',
  templateUrl: './create-ot-dialog.component.html',
  styleUrls: ['./create-ot-dialog.component.scss']
})



export class CreateOtDialogComponent implements OnInit {
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
  titleAlert: string = "Requerido"
  itemOTForm = [{ selectedItemId: '', ot_id: '', quantity: '' }]
  isCreating: boolean = false
  public civil_chofer: any = []
  public item_OH: any = []
  public item_OC: any = []
  public conductorName: string
  public movilId: string
  street: string
  number_street: number
  commune: string


  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() Complete: EventEmitter<any> = new EventEmitter();
  @Output() otEvent = new EventEmitter<string>();

  constructor(private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateOtDialogComponent>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private dataSharingService: DataSharingService,
  ) {

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
    console.warn("CREATE" + this.data.url)
    switch (this.data.url) {
      case "mantenedorOt":


        this.formGroup = this.formBuilder.group({
          'ot_id': [null, Validators.required],
          'ot_state': [null, Validators.required],
          'direction': [{ value: '', disabled: false }, Validators.required],
          'civil_movil_id': [null, Validators.required],
          'hydraulic_movil_id': [null, Validators.required],
          'n_hidraulico': [null, Validators.required],
          'n_civil': [null, Validators.required],
          'observation': [null, Validators.required],

          // 'quantity':[null, Validators.required],

        })

        this.getMovilOc()
        this.getItemOC()
        this.getItemOH()
        break;


    }
    // if(this.data.values){
    //   this.editing = true;
    //   this.tit_btn = "Editar";
    //   this.fillUp();
    // }
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

  formButtonEvent() {
    const regex = /([^\d]+)\s*(\d+)\s*(.*)/;
    const match = this.formGroup.value.direction.match(regex);
    if (match) {
      this.street = match[1].trim();
      this.number_street = parseInt(match[2]);
      this.commune = match[3].trim();
      // Output: ALBERTO BLEST GANA 635 PADRE HURTADO
    }
    const today = new Date()
    const formattedDate = moment(today).format('YYYY-MM-DD')
    let formOT: otDBModel = {
      ot_state: this.formGroup.value.ot_state,
      civil_movil_id: this.formGroup.value.civil_movil_id,
      hydraulic_movil_id: this.formGroup.value.hydraulic_movil_id,
      observation: this.formGroup.value.observation,
      started_at: formattedDate,
      street: this.street,
      number_street: this.number_street,
      commune: this.commune,
      ot_id: this.formGroup.value.ot_id
    }

    const data = [formOT.ot_id, formOT.hydraulic_movil_id]
    const subOTitm = this.apiService.postOt(formOT)
      .subscribe({

        next: (response) => { subOTitm.unsubscribe; this.Complete.emit(formOT.ot_id); this.dialog.closeAll(); this.dataSharingService.emitData(data); },
        error: (error) => console.log(error),
      })





  }

  //Trae los móviles de civil y los nombres de los chóferes
  getMovilOc() {
    const id = this.data.inventory

    lastValueFrom(this.apiService.getMovilOc())
      .then(payload => {

        this.civil_chofer = payload
        //this.civil_chofer = Object.values(this.civil_chofer.rows)
      })
      .catch(err => {
        alert("Error al cargar Movil OC")
        console.error(this.civil_chofer)
      });
  }


  getItemOH() {

    lastValueFrom(this.apiService.getItemOH())
      .then(payload => {

        this.item_OH = payload
        console.log(this.item_OH)
        // this.item_OH = Object.values(this.item_OH)
      })
      .catch(err => {
        alert("Error al cargar los PARTIDAS OH")
        console.error(this.item_OH)
      });
  }
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

  // Esto pone el nombre del conductor según el id del movil

  NameOfConductor(row: any) {

    const Name = this.civil_chofer.find((((name: { movil_id: string; }) => name.movil_id === row)));
    this.conductorName = Name.name
    this.movilId = row.movil_id


  }
  selectedItemId: string;
  selectedItemDescription: string[] = new Array(10).fill('');;
  selectedItemValue: number[] = new Array(10).fill(0);;
  totalValueItem: number[] = new Array(10).fill(0);;

  onItemIdChanged(event: any, index: number) {
    const selectedItem = this.item_OH.find((((item: { item_id: string; }) => item.item_id === event.target.value)));
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


  redirectTo() {
    this.router.navigate(['/partidas-oh']);
  }

  changeTabIndex(delta: number) {
    const newTabIndex = this.tabRouting + delta;
    if (newTabIndex >= 0 && newTabIndex < 4) {
      this.tabRouting = newTabIndex;
    }
  }

  emitData() {
    const data = 'Datos para compartir';
    this.dataSharingService.emitData(data);
  }


}




