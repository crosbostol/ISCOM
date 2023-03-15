const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

const getInvPro = async (req, res) =>{
    const response =  await  pool.query('SELECT * FROM inv_pro',
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const getTotalOfProduct = async (req, res) =>{
console.log(req.params.product_id)

    const sql = 'SELECT SUM(quantity) FROM inv_pro where product_id = $1'
    const values = [req.params.product_id]
    const response =  await  pool.query(sql,values,
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };


 const postInvPro = async (req, res) =>{
     
     const {product_id, inventory_id,quantity} = req.body
     const sql = 'INSERT INTO inv_pro (product_id, inventory_id,quantity) VALUES ($1,$2,$3)'
     const values =[product_id, inventory_id,quantity]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });


     
  };
 
  const getInvProById = async (req,res) => {

    const sql = 'SELECT * FROM inv_pro where product_id = $1 and inventory_id=$2 '
    const values = [req.params.product_id, req.params.inventory_id]
     const response =  await  pool.query(sql,values,
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };

  const getInvProByInventoryId = async (req,res) => {

    const sql = 'SELECT * FROM inv_pro where inventory_id=$1 '
    const values = [req.params.inventory_id]
     const response =  await  pool.query(sql,values,
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };


 
  const deleteInvProById = async (req, res) => {
     
    
     const sql = 'DELETE FROM inv_pro WHERE product_id = $1 and inventory_id = $2'
     const values = [req.params.product_id, req.params.inventory_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        }  );
     
  };
 
  const updateInvPro = async (req,res) => {
    const {product_id, inventory_id,quantity} = req.body
    const product_Id = req.params.product_Id
    const inventory_Id = req.params.inventory_Id
    const values =[product_id, inventory_id,quantity, product_Id,inventory_Id]
    const sql = 'UPDATE inv_pro SET product_id = $1, inventory_id=$2,quantity = $3  WHERE product_Id = $4 and inventory_id = $5'
     
    
      await pool.query(sql, values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        } );
     
    
 
  }
 
 
 
 module.exports = {
    getInvPro,
    postInvPro,
    getInvProById,
    deleteInvProById,
    updateInvPro,
    getInvProByInventoryId,
    getTotalOfProduct
   
 }