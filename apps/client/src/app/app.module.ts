import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table'
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

import { HomeComponent } from './home/home.component';
import { MantenedorOtComponent } from './features/work-orders/mantenedor-ot.component';
import { MantenedorMovilComponent } from './features/mobile-maintenance/mantenedor-movil.component';
import { MantenedorInventarioComponent } from './features/inventory/mantenedor-inventario.component';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { NavigationComponent } from './layout/sidebar/navigation.component';
import { FormDialogComponent } from './shared/components/dialogs/formDialog/form-dialog.component';
import { FormularioComponent } from './shared/components/formulario/formulario.component';
import { AddDialogComponent } from './shared/components/dialogs/addDialog/add-dialog.component';
import { AsociateDialogComponent } from './shared/components/dialogs/asociateDialog/asociate-dialog.component';
import { oTItemDialogComponent } from './shared/components/formularios/otItemDialog/ot-item-dialog.component';
import { oTMaterialDialogComponent } from './shared/components/formularios/otMaterialDialog/ot-material-dialog.component';
import { oTItemOCDialogComponent } from './shared/components/formularios/otItemOcDialog/ot-itemOC-dialog.component';
import { CreateOtDialogComponent } from './shared/components/dialogs/createOtDialog/create-ot-dialog.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Importa MatNativeDateModule

import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    DashboardComponent,
    HomeComponent,
    MantenedorOtComponent,
    MantenedorMovilComponent,
    MantenedorInventarioComponent,
    PageNotFoundComponent,
    FormularioComponent,
    FormDialogComponent,
    AddDialogComponent,
    AsociateDialogComponent,
    oTItemDialogComponent,
    oTMaterialDialogComponent,
    oTItemOCDialogComponent,
    CreateOtDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    HttpClientModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    FormsModule,
    MatTabsModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe],
  entryComponents: [MatDialogModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
