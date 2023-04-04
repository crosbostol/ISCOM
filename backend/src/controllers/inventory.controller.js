const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

const postInventory = async (req, res) =>{
     
    const {inventory_id} = req.body
    const sql = 'INSERT INTO inventory (inventory_id) VALUES ($1)'
    const values =[inventory_id]
    const response =  await  pool.query(sql,values,
       (error, results) => {
           if(error){
               console.log('error', error)
               return res.status(500).send(error)
           }
           res.status(201).send(results)
       });
 };

const getUniqueInventories = async (req, res) =>{
    const sql = 'SELECT inventory_id from inventory'
    await pool.query(sql,(error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results)
    });
}

 const getInventory = async (req, res) =>{
    const sql = 'SELECT inv.inventory_id, pro.product_id, pro.product_name, inv_pro.quantity FROM inventory inv INNER JOIN inv_pro ON inv_pro.inventory_id = inv.inventory_id INNER JOIN product pro ON pro.product_id = inv_pro.product_id'
 
    const response =  await  pool.query(sql,
       (error, results) => {
           if(error){
               console.log('error', error)
               return res.status(500).send(error)
           }
          return res.status(201).send(results)
       });
 };


 const getInventoryById = async (req,res) => {
    const response =  await  pool.query('SELECT inv.inventory_id, pro.product_id, pro.product_name, inv_pro.quantity, pro.product_unit,pro.product_category  FROM inventory inv INNER JOIN inv_pro ON inv_pro.inventory_id = inv.inventory_id INNER JOIN product pro ON pro.product_id = inv_pro.product_id WHERE inv.inventory_id = $1',[req.params.inventory_id],
    (error, results) => {
       if(error){
           console.log('error', error)
           return res.status(500).send(error)
       }
      return res.status(201).send(results.rows)
   });
   
   
 };



 const deleteInventory = async (req, res) => {
    const inventory_id = req.params.inventory_id
    const sql = 'DELETE FROM inventory where inventory_id = $1'
    const values = [inventory_id]
    await pool.query(sql,values,
        (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       res.status(201).send(results)
    })


 };
 const putInventory = async (req, res) => {
    const inventory_Id = req.params.inventory_id
    const {inventory_id} = req.body
    const values = [inventory_id,inventory_Id]
    const sql = 'UPDATE inventory SET inventory_id=$1 where inventory_id = $2'
    await pool.query(sql,values,
        (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       res.status(201).send(results)
    })


 }




 module.exports = {
    postInventory,
    getInventory,
    deleteInventory,
    putInventory,
    getInventoryById,
    getUniqueInventories
    
 }