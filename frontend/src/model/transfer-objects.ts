  export interface conductorDBModel {
    conductor_id : string,
    movil_id: string,
    name: string,
    rut: string
  }

  export interface imageDBModel {
    image_id: number,
    url: string,
    ot_id: string
  }
  export interface inv_proDBModel {
    product_id: number,
    inventory_id : string,
    quantity: number
  }
  export interface inventoryDBModel {
    inventory_id : string,
  }
  export interface itemDBModel {
    item_id:string,
    description:string,
    item_value:number,
    item_type:string,
    item_unit:string
  }
  export interface itm_otDBModel {
    item_id:string,
    ot_id:string,
    quantity:number,

  }
  export interface movilDBModel {
    movil_id :string,
    inventory_id:string,
    movil_state:string,
    movil_observations:string,
    movil_type:string
  }
  export interface otDBModel {
    ot_id:string,
    hydraulic_movil_id:string,
    civil_movil_id:string,
    ot_state:string,
    received_at?:string,
    started_at:string,
    finished_at?:string,
    observation:string,
    street?:string,
    number_street?:number,
    commune?:string,
    fuga_location?:string,
    altitude?:number,
    latitude?:number,
    dismissed?:boolean
  }
  export interface pro_otDBModel{
    ot_id:string,
    product_id:number,
    quantity:number,
    inventory_id: string
  }

  export interface productDBModel{
    product_id?:number,
    product_name:string,
    product_category:string,
    product_unit:string,
  }
