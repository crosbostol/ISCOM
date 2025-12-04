import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { ApiService } from 'src/app/core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Monto Mensual', cols: 1, rows: 1, isdata: this.isData },
          { title: 'Partidas más repetidas', cols: 1, rows: 1, isdata: this.isDataCard2 },
          { title: 'Producción por móvil', cols: 1, rows: 1, isdata: this.isDataCard3 },
          { title: 'Alertas inventario', cols: 1, rows: 1 }
        ];
      }

      return [
        { title: 'Monto Mensual', cols: 2, rows: 1, isdata: this.isData },
        { title: 'Partidas más repetidas', cols: 1, rows: 1, isdata: this.isDataCard2 },
        { title: 'Producción por móvil', cols: 1, rows: 2, isdata: this.isDataCard3 },
        { title: 'Alertas inventario', cols: 1, rows: 1, isdata: this.isDataCard4 }
      ];
    })
  );
  isData: boolean;
  public totalMonthValue: any = {}
  public totalOfItems: any = {}
  public monthlyYield: any = {}
  public totalOfIventory: any = {}
  isDataCard2: boolean;
  barChart: any;
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas: ElementRef;
  isDataCard3: any | undefined;
  isDataCard4: boolean;
  filteredInventory: any;


  constructor(private breakpointObserver: BreakpointObserver, private apiService: ApiService, private dialog: MatDialog, private route: ActivatedRoute) { }

  capturedDates = {
    date1: '',
    date2: ''
  };

  chartdata: any;

  labeldata: any[] = [];
  realdata: any[] = [];
  colordata: any[] = [];

  labeldataYield: any[] = [];
  realdataYield: any[] = [];
  colordataYield: any[] = [];
  ngOnInit() {
    this.getTotalOfInventory()
    console.log(this.route.snapshot.url[0].path)
    this.loadMonthlyYield();
    this.loadUniqueInventories();
    this.getTotalOfItems();



    this.apiService.getTotalOfItems().subscribe(result => {
      this.chartdata = result;
      if (this.chartdata.rows != null) {
        for (let i = 0; i < this.chartdata.rows.length; i++) {
          this.labeldata.push(this.chartdata.rows[i].item_id);
          this.realdata.push(this.chartdata.rows[i].repetition_count);
          this.colordata.push(this.generateRandomColor());
        }

        this.RenderChart('Cantidad', this.labeldata, this.realdata, this.colordata, 'bar', 'barchart', 'x');
        //this.RenderChart(this.labeldata,this.realdata,this.colordata,'pie','piechart');
        // this.RenderChart(this.labeldata,this.realdata,this.colordata,'doughnut','dochart');
        // this.RenderChart(this.labeldata,this.realdata,this.colordata,'polarArea','pochart');

        // this.RenderChart(this.labeldata,this.realdata,this.colordata,'radar','rochart');


      }
    });
    // this.RenderBubblechart();
    // this.RenderScatterchart();
    this.apiService.getMonthlyYield().subscribe(result => {
      this.chartdata = result;
      if (this.chartdata.rows != null) {
        for (let i = 0; i < this.chartdata.rows.length; i++) {
          this.labeldataYield.push(this.chartdata.rows[i].hydraulic_movil_id);
          this.realdataYield.push(this.chartdata.rows[i].item_count);
          this.colordataYield.push(this.generateRandomColor());
        }

        this.RenderChart('Cantidad por móvil', this.labeldataYield, this.realdataYield, this.colordataYield, 'bar', 'barchartHorizontal', 'y');
        //this.RenderChart(this.labeldata,this.realdata,this.colordata,'pie','piechart');
        // this.RenderChart(this.labeldata,this.realdata,this.colordata,'doughnut','dochart');
        // this.RenderChart(this.labeldata,this.realdata,this.colordata,'polarArea','pochart');

        // this.RenderChart(this.labeldata,this.realdata,this.colordata,'radar','rochart');


      }
    });


  }
  ngAfterViewInit() {

  }


  generateRandomColor() {
    // Genera valores aleatorios para los componentes rojo, verde y azul
    var r = Math.floor(Math.random() * 256); // Valor entre 0 y 255
    var g = Math.floor(Math.random() * 256); // Valor entre 0 y 255
    var b = Math.floor(Math.random() * 256); // Valor entre 0 y 255

    // Combina los componentes de color en una cadena en formato RGBA
    var color = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.2)';

    return color;
  }

  loadUniqueInventories() {
    lastValueFrom(this.apiService.getMonthValue('2023-04-17', '2023-05-22'))
      .then(payload => {
        this.isData = true;
        this.totalMonthValue = payload

      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });
  }

  loadMonthlyYield() {
    lastValueFrom(this.apiService.getMonthlyYield())
      .then(payload => {
        this.isDataCard3 = true;
        this.monthlyYield = payload

      })
      .catch(err => {
        this.isDataCard3 = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });
  }



  getTotalOfItems() {
    lastValueFrom(this.apiService.getTotalOfItems())
      .then(payload => {
        this.isDataCard2 = true;
        this.totalOfItems = payload

      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });
  }


  getTotalOfInventory() {
    console.log("hola")
    lastValueFrom(this.apiService.getInvPro())
      .then(payload => {
        this.isDataCard4 = true;
        this.totalOfIventory = payload
        this.filteredInventory = this.totalOfIventory.filter((item: { quantity: number; }) => item.quantity < 8);

        console.warn(this.totalOfIventory)
      })
      .catch(err => {
        this.isDataCard4 = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });
  }



  // Función para transformar una fecha al formato "YYYY-MM-DD"
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getValueFromDates() {

    if (this.capturedDates.date1) {
      const formattedDate1 = this.formatDate(new Date(this.capturedDates.date1));
      this.capturedDates.date1 = formattedDate1;
    }

    if (this.capturedDates.date2) {
      const formattedDate2 = this.formatDate(new Date(this.capturedDates.date2));
      this.capturedDates.date2 = formattedDate2;
    }



    lastValueFrom(this.apiService.getMonthValue(this.capturedDates.date1, this.capturedDates.date2))
      .then(payload => {
        this.isData = true;
        console.log("aaa", payload)
        this.totalMonthValue = payload
        console.log("🚀 ~ file: dashboard.component.ts:51 ~ DashboardComponent ~ loadUniqueInventories ~ this.totalMonthValue:", this.totalMonthValue)

        console.warn(this.totalMonthValue.rows)
      })
      .catch(err => {
        this.isData = false;
        alert("Error al cargar los inventarios")
        console.error(err)
      });
  }


  RenderChart(title: any, labeldata: any, maindata: any, colordata: any, type: any, id: any, indexAxis: any) {
    const myChart = new Chart(id, {
      type: type,
      data: {
        labels: labeldata,
        datasets: [{
          label: title,
          data: maindata,
          backgroundColor: colordata,
          borderColor: [
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: indexAxis,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
    });

  }

  currentIndex: number = 0; // Índice actual
  maxIndex: number; // Índice máximo
  minIndex: number = 0; // Índice mínimo

  // Función para avanzar al siguiente elemento
  nextItem() {
    this.maxIndex = this.filteredInventory.length - 1;
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  // Función para retroceder al elemento anterior
  previousItem() {
    if (this.currentIndex > this.minIndex) {
      this.currentIndex--;
    }
  }

  // Función para obtener el estado de deshabilitado del botón de avance
  isNextDisabled() {
    return this.currentIndex === this.maxIndex;
  }

  // Función para obtener el estado de deshabilitado del botón de retroceso
  isPreviousDisabled() {
    return this.currentIndex === this.minIndex;
  }
}
