import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { inventoryDBModel,inv_proDBModel,productDBModel,otDBModel, itm_otDBModel,pro_otDBModel } from 'src/model/transfer-objects';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getInventories(){
    const url = `${this.apiUrl}/inventory`;


    return this.http.get(url)
  }
  getInventoryById(inventory_id : string){
    const url = `${this.apiUrl}/inventory/${inventory_id}`;

    return this.http.get(url)
  }
  postInventory(inventory: inventoryDBModel ): Observable<any>{
    const url = `${this.apiUrl}/inventory`;

    return this.http.post<any>(url, inventory)
  }
  getUniqueInventory(){
    const url = `${this.apiUrl}/inventory/unique`;
    return this.http.get(url)
  }
  putInvPro(body: inv_proDBModel): Observable<any>{
    const url = `${this.apiUrl}/invpro/${body.product_id}/${body.inventory_id}`;

    return this.http.put(url, body)
  }
  postProduct(body: productDBModel):Observable<any>{
    const url = `${this.apiUrl}/product`;

    return this.http.post(url,body)
  }
  postRelationInvPro(body: inv_proDBModel):Observable<any>{
    const url = `${this.apiUrl}/invpro`;

    return this.http.post(url, body)
  }
  getProductNotInInventory(inventory_id : string){
    const url = `${this.apiUrl}/invpro/products/not-in/${inventory_id}`;

    return this.http.get(url)
  }
  getInfoOtForTable(){
    const url = `${this.apiUrl}/ottable`;
    return this.http.get(url)
  }
  getMovilOc(){
    const url = `${this.apiUrl}/movil/get/oc`;

    return this.http.get(url)
  }

  getItemOH(){
    const url = `${this.apiUrl}/item-oh`;

    return this.http.get(url)
  }
  getItemOC(){
    const url = `${this.apiUrl}/item-oc`;

    return this.http.get(url)
  }

  putOT(body: otDBModel): Observable<any>{
    const url = `${this.apiUrl}/ot/${body.ot_id}`;

    return this.http.put(url, body)
  }
  postItmOt(body:itm_otDBModel):Observable<any>{
    const url = `${this.apiUrl}/itmot`;

    console.log("🚀 ~ file: api.service.ts:59 ~ ApiService ~ postItmOt ~ body:", body)
    return this.http.post(url, body)
  }

  getProductsOh(){
    const url = `${this.apiUrl}/product`;

    return this.http.get(url)
  }
  postMatOt(body:pro_otDBModel):Observable<any>{

    const url = `${this.apiUrl}/pro-ot`;

    return this.http.post(url,body)

  }
  getDetailsOtProduct(ot_id: string){
    const url = `${this.apiUrl}/detailsOtProduct/${ot_id}`;

    return this.http.get(url)

  }
  getDetailsOtItem(ot_id: string, item_type:string){
    const url = `${this.apiUrl}/detailsOtItem/${ot_id}/${item_type}`;

    return this.http.get(url)

  }
  getInfoOtForTableByState(state:string){
    const url = `${this.apiUrl}/ottable/${state}`;

    return this.http.get(url)
  }
  postOt(body:otDBModel):Observable<any>{
    const url = `${this.apiUrl}/ot`;

    return this.http.post(url,body)
  }

  getMonthValue(date1:string, date2:string){
    const url = `${this.apiUrl}/dashboard/monthValue/${date1}/${date2}}`;

    return this.http.get(url)
  }

  getTotalOfItems(){
    const url = `${this.apiUrl}/dashboard/totalItems`;

    return this.http.get(url)
  }

  getMonthlyYield(){
    const url = `${this.apiUrl}/dashboard/monthlyYield`;

    return this.http.get(url)
  }
  getInvPro(){
    console.log("estoy en service")
    const url = `${this.apiUrl}/invpro/get`;

    return this.http.get(url)
  }
}

