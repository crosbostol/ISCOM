const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})


const getItmOt = async (req, res) =>{
    const response =  await  pool.query('Select *, itm_ot.quantity*item.item_value AS item_Total FROM itm_ot INNER JOIN item ON item.item_id = itm_ot.item_id',
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const getItmByOt = async (req, res) =>{
console.log(req.params.product_id)

    const sql = 'Select *, itm_ot.quantity*item.item_value AS item_Total  FROM itm_ot INNER JOIN item ON item.item_id = itm_ot.item_id WHERE itm_ot.ot_id = $1'
    const values = [req.params.ot_id]
    const response =  await  pool.query(sql,values,
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };


 const postItmOt = async (req, res) =>{
     
     const {item_id, ot_id,quantity} = req.body
     const sql = 'INSERT INTO itm_ot (item_id, ot_id,quantity) VALUES ($1,$2,$3)'
     const values =[item_id, ot_id,quantity]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });


     
  };
 
  const deleteItmOtById = async (req, res) => {
     
    
     const sql = 'DELETE FROM itm_ot WHERE item_id = $1 and ot_id = $2'
     const values = [req.params.item_id, req.params.ot_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        }  );
     
  };
 
  const updateItmOt = async (req,res) => {
    const {item_id, ot_id,quantity} = req.body
    const item_Id = req.params.item_Id
    const ot_Id = req.params.ot_Id
    const values =[item_id, ot_id,quantity,item_Id,ot_Id ]
    const sql = 'UPDATE itm_ot SET item_id = $1, ot_id=$2,quantity = $3  WHERE item_Id = $4 and ot_Id = $5'
     
    
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
    getItmOt,
    getItmByOt,
    postItmOt,
    deleteItmOtById,
    updateItmOt

    
   
 }