import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DashboardComponent } from './navegacion/dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

import { HomeComponent } from './home/home.component';
import { MantenedorOtComponent } from './navegacion/mantenedor-ot/mantenedor-ot.component';
import { MantenedorMovilComponent } from './navegacion/mantenedor-movil/mantenedor-movil.component';
import { MantenedorInventarioComponent } from './navegacion/mantenedor-inventario/mantenedor-inventario.component';
import { PageNotFoundComponent } from './navegacion/page-not-found/page-not-found.component';
import { NavigationComponent } from './navegacion/navigation/navigation.component';
import { FormDialogComponent } from './navegacion/dialogs/formDialog/form-dialog.component';
import { FormularioComponent } from './navegacion/formulario/formulario.component';
import { AddDialogComponent } from './navegacion/dialogs/addDialog/add-dialog.component';
import { AsociateDialogComponent } from './navegacion/dialogs/asociateDialog/asociate-dialog.component';
import { oTItemDialogComponent } from './navegacion/formularios/otItemDialog/ot-item-dialog.component';
import { oTMaterialDialogComponent } from './navegacion/formularios/otMaterialDialog/ot-material-dialog.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
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
    oTMaterialDialogComponent
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
    MatTabsModule


  ],
  providers: [],
  entryComponents:[MatDialogModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
