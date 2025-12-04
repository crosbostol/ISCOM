import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { inventoryDBModel, inv_proDBModel, productDBModel, } from 'src/model/transfer-objects';
import { MantenedorInventarioComponent } from '../../../../features/inventory/mantenedor-inventario.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asociate-dialog',
  templateUrl: './asociate-dialog.component.html',
  styleUrls: ['./asociate-dialog.component.scss']
})


export class AsociateDialogComponent implements OnInit {
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
  titleAlert: string = "Requerido"
  form: FormGroup;
  isData: boolean = false
  id: string
  public products: any = []

  @Output() close: EventEmitter<any> = new EventEmitter();
  constructor(private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AsociateDialogComponent>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    if (data) {
      this.message = data.message || this.message;
      if (data.buttonText) {
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText
      }
    }
    this.dialogRef.updateSize('100vw', '100vw')
  }

  ngOnInit() {

    switch (this.data.url) {
      case "mantenedorInventario":


        this.formGroup = this.formBuilder.group({
          'product_name': [null, Validators.required],
          'inventory_id': [{ value: '', disabled: true }, Validators.required],
          'quantity': [null, Validators.required]

        })
        this.formGroup.controls['inventory_id'].setValue(this.data.inventory)
        this.getProductNotInInventory();
        break;
    }
  }



  formButtonEvent() {

    switch (this.data.url) {
      case "mantenedorInventario":
        let ProductInventory: inv_proDBModel = {
          product_id: this.formGroup.value.product_name.product_id,
          inventory_id: this.data.inventory,
          quantity: this.formGroup.value.quantity
        }
        console.log(ProductInventory)
        const sub = this.apiService.postRelationInvPro(ProductInventory)
          .subscribe({
            next: (response) => { sub.unsubscribe; this.dialog.closeAll(); this.close.emit(); console.log(response) },
            error: (error) => console.log(error),
          });
        break;


    }



    //  // var formData: any = new FormData();




  }

  getProductNotInInventory() {
    const id = this.data.inventory
    console.log("🚀 ~ file: mantenedor-inventario.component.ts:35 ~ MantenedorInventarioComponent ~ loadInventario ~ id:", id)

    lastValueFrom(this.apiService.getProductNotInInventory(id))
      .then(payload => {
        this.isData = true;
        this.products = payload
        this.products = Object.values(this.products.rows)
        console.log(this.products)
      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los productos")
        console.error(err)
      });
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




