import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { inventoryDBModel,inv_proDBModel,productDBModel,otDBModel, itm_otDBModel } from 'src/model/transfer-objects';

@Injectable({
  providedIn: 'root'
})

export class ApiService {



  constructor(private http: HttpClient) { }

  getInventories(){
    return this.http.get('/api/inventory')
  }
  getInventoryById(inventory_id : string){
    return this.http.get(`/api/inventory/${inventory_id}`)
  }
  postInventory(inventory: inventoryDBModel ): Observable<any>{
    console.log(inventory)
    return this.http.post<any>('/api/inventory', inventory)
  }
  getUniqueInventory(){
    return this.http.get('/api/inventory/unique')
  }
  putInvPro(body: inv_proDBModel): Observable<any>{
    return this.http.put(`/api/invpro/${body.product_id}/${body.inventory_id}`, body)
  }
  postProduct(body: productDBModel):Observable<any>{
    return this.http.post('/api/product',body)
  }
  postRelationInvPro(body: inv_proDBModel):Observable<any>{
    return this.http.post('/api/invpro', body)
  }
  getProductNotInInventory(inventory_id : string){
    return this.http.get(`/api/invpro/products/not-in/${inventory_id}`)
  }
  getInfoOtForTable(){
    return this.http.get('/api/ottable')
  }
  getMovilOc(){
    return this.http.get('/api/movil/get/oc')
  }

  getItemOH(){
    return this.http.get('/api/item-oh')
  }
  getItemOC(){
    return this.http.get('/api/item-oc')
  }

  putOT(body: otDBModel): Observable<any>{
    return this.http.put(`/api/ot/${body.ot_id}`, body)
  }
  postItmOt(body:itm_otDBModel):Observable<any>{
    console.log("🚀 ~ file: api.service.ts:59 ~ ApiService ~ postItmOt ~ body:", body)
    return this.http.post('/api/itmot', body)
  }

  getProductsOh(){
    return this.http.get('/api/product')
  }

}
