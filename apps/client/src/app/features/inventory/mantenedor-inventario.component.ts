import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../shared/components/formulario/formulario.component';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormDialogComponent } from '../../shared/components/dialogs/formDialog/form-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { AddDialogComponent } from '../../shared/components/dialogs/addDialog/add-dialog.component';
import { AsociateDialogComponent } from '../../shared/components/dialogs/asociateDialog/asociate-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-mantenedor-inventario',
  templateUrl: './mantenedor-inventario.component.html',
  styleUrls: ['./mantenedor-inventario.component.scss']
})



export class MantenedorInventarioComponent implements OnInit {
  private isData: boolean = false;
  public inventories: any = []
  public inventory_id: string = "INV-JJKX21"
  public row: any = {}
  corruntRoute: String
  @ViewChild('paginator') paginator: MatPaginator;
  constructor(private apiService: ApiService, private dialog: MatDialog, private route: ActivatedRoute) {



  }

  ngOnInit() {
    console.log(this.route.snapshot.url[0].path)
    this.loadInventario(this.inventory_id)
    this.loadUniqueInventories()
  }
  displayedColumns: string[] = ['inventory_id',
    'product_id',
    'product_category',
    'product_name',
    'product_unit',
    'quantity',
    'options'
  ]
  dataSource: any = []




  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.warn(this.dataSource.filter)
  }



  loadInventario(id: string) {
    console.log("🚀 ~ file: mantenedor-inventario.component.ts:35 ~ MantenedorInventarioComponent ~ loadInventario ~ id:", id)
    this.inventory_id = id
    lastValueFrom(this.apiService.getInventoryById(id))
      .then(payload => {
        this.isData = true;
        this.dataSource = payload
        this.dataSource = new MatTableDataSource(this.dataSource)
        this.dataSource.paginator = this.paginator

        console.log(this.dataSource)
      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });



  }
  loadUniqueInventories() {
    lastValueFrom(this.apiService.getUniqueInventory())
      .then(payload => {
        this.isData = true;
        this.inventories = payload
        //this.inventories = Object.values(this.inventories.rows)
        console.warn(this.inventories)
      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });
  }

  onRowClicked(row: any) {
    console.log('Row clicked: ', row);
  }

  openEditDialog(row: any) {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      maxWidth: '28rem',
      maxHeight: '32rem',
      height: '100%',
      width: '100%',

      data: {
        values: row,
        url: this.route.snapshot.url[0].path


      }
    })
    const sub = dialogRef.componentInstance.close.subscribe(() => {

      this.loadInventario(this.inventory_id)

    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })



  }

  addMaterial() {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      maxWidth: '28rem',
      maxHeight: '32rem',
      height: '100%',
      width: '100%',
      data: {
        //values: row,
        url: this.route.snapshot.url[0].path
      }
    }
    )
  }


  asociarMaterial() {
    const dialogRef = this.dialog.open(AsociateDialogComponent, {
      maxWidth: '28rem',
      maxHeight: '32rem',
      height: '100%',
      width: '100%',
      data: {
        //values: row,
        url: this.route.snapshot.url[0].path,
        inventory: this.inventory_id
      }

    })
    const sub = dialogRef.componentInstance.close.subscribe(() => {

      this.loadInventario(this.inventory_id)

    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })


  }


}




