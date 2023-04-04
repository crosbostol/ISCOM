import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MantenedorOtComponent } from './navegacion/mantenedor-ot/mantenedor-ot.component';
import { MantenedorMovilComponent } from './navegacion/mantenedor-movil/mantenedor-movil.component';
import { MantenedorInventarioComponent } from './navegacion/mantenedor-inventario/mantenedor-inventario.component';
import { PageNotFoundComponent } from './navegacion/page-not-found/page-not-found.component';

//rutas de navegación
const routes: Routes = [
  {path: '', redirectTo:'/home', pathMatch:'full'},
  {path: 'home', component: HomeComponent},
  {path: 'mantenedorOt', component: MantenedorOtComponent},
  {path: 'mantenedorMovil', component: MantenedorMovilComponent},
  {path: 'mantenedorInventario', component: MantenedorInventarioComponent},
  {path: '**', component: PageNotFoundComponent},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
