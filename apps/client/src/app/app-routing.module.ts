import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MantenedorOtComponent } from './features/work-orders/mantenedor-ot.component';
import { MantenedorMovilComponent } from './features/mobile-maintenance/mantenedor-movil.component';
import { MantenedorInventarioComponent } from './features/inventory/mantenedor-inventario.component';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { oTItemDialogComponent } from './shared/components/formularios/otItemDialog/ot-item-dialog.component';
import { oTMaterialDialogComponent } from './shared/components/formularios/otMaterialDialog/ot-material-dialog.component';
//rutas de navegación
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'mantenedorOt', component: MantenedorOtComponent },
  { path: 'mantenedorMovil', component: MantenedorMovilComponent },
  { path: 'mantenedorInventario', component: MantenedorInventarioComponent },
  { path: '**', component: PageNotFoundComponent },
  { path: 'partidas-oh', component: oTItemDialogComponent },
  { path: 'material-oh', component: oTMaterialDialogComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
