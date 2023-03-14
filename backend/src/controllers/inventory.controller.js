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

 const getInventory = async (req, res) =>{
     
    
    const sql = 'Select inventory_id from inventory'
   
    const response =  await  pool.query(sql,
       (error, results) => {
           if(error){
               console.log('error', error)
               return res.status(500).send(error)
           }
          return res.status(201).send(results)
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
    putInventory
    
 }