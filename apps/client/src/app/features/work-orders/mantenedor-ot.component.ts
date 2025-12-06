import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { interval, take, lastValueFrom } from 'rxjs';
import { FormularioComponent } from '../../shared/components/formulario/formulario.component';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormDialogComponent } from '../../shared/components/dialogs/formDialog/form-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { AddDialogComponent } from '../../shared/components/dialogs/addDialog/add-dialog.component';
import { AsociateDialogComponent } from '../../shared/components/dialogs/asociateDialog/asociate-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { CreateOtDialogComponent } from '../../shared/components/dialogs/createOtDialog/create-ot-dialog.component';


@Component({
  selector: 'app-mantenedor-ot',
  templateUrl: './mantenedor-ot.component.html',
  styleUrls: ['./mantenedor-ot.component.scss']
})
export class MantenedorOtComponent implements OnInit {
  public filterOptions: any = ['CREADA', 'OBRA CIVIL', 'RETIRO', 'FINALIZADA']
  private isData: boolean = false;
  public inventories: any = []
  public inventory_id: string = "INV-JJKX21"
  public row: any = {}
  differenceInDays: number
  corruntRoute: String
  @ViewChild('paginator') paginator: MatPaginator;
  selectedOption: any;

  constructor(private apiService: ApiService, private dialog: MatDialog, private route: ActivatedRoute, private datePipe: DatePipe) {



  }

  ngOnInit() {
    console.log(this.route.snapshot.url[0].path)
    console.log("primero")
    this.loadOTs()
    //this.loadUniqueInventories()
  }

  ngAfterViewInit() {
    console.log("🚀ESTE PASO SEGUNDO ~ file: mantenedor-ot.component.ts:41 ~ MantenedorOtComponent ~ ngAfterViewInit ~ this.dataSource:", this.dataSource)


  }

  displayedColumns: string[] = ['ot_id',
    'direction',
    'hydraulic_movil_id',
    'n_hidraulico',
    'civil_movil_id',
    'n_civil',
    'started_at',
    'ot_state',
    'options',

  ]
  dataSource: any = []
  expiredDate: any
  formattedStartDate(row: any) {
    if (row.started_at != null) {

      const dateToday = new Date()
      const dateRow = new Date(row.started_at)
      const differenceInMilliseconds = dateToday.getTime() - dateRow.getTime();
      this.differenceInDays = Math.floor(differenceInMilliseconds / 86400000);
    }
    return this.datePipe.transform(row.started_at, 'dd/MM/yyyy');
  }

  formattedFinishDate(row: any) {
    return this.datePipe.transform(row.finished_at, 'dd/MM/yyyy');
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.warn(this.dataSource.filter)
  }



  loadOTs() {
    lastValueFrom(this.apiService.getInfoOtForTable())
      .then(payload => {
        this.isData = true;
        this.dataSource = payload
        this.dataSource = new MatTableDataSource(this.dataSource)
        this.dataSource.paginator = this.paginator
        //console.log(this.dataSource)
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
      maxWidth: '57rem',
      maxHeight: '44rem',
      height: '100%',
      width: '100%',

      data: {
        values: row,
        url: this.route.snapshot.url[0].path


      }
    })
    const sub = dialogRef.componentInstance.close.subscribe(() => {

      this.loadOTs()

    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })



  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateOtDialogComponent, {
      maxWidth: '57rem',
      maxHeight: '44rem',
      height: '100%',
      width: '100%',

      data: {
        values: {},
        url: this.route.snapshot.url[0].path


      }
    })
    const sub = dialogRef.componentInstance.close.subscribe(() => {

      this.loadOTs()

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

      this.loadOTs()

    })
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe()
    })


  }

  loadOtByState(id: string) {
    console.log("🚀 ~ file: mantenedor-inventario.component.ts:35 ~ MantenedorInventarioComponent ~ loadInventario ~ id:", id)
    lastValueFrom(this.apiService.getInfoOtForTableByState(id))
      .then(payload => {
        this.isData = true;
        this.dataSource = payload
        console.log(this.dataSource)

        this.dataSource = new MatTableDataSource(this.dataSource)
        this.dataSource.paginator = this.paginator


      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los ot")
        console.error(err)
      });



  }


}
