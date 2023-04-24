const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

const getProOtbyOt = async (req, res) =>{
    ot_id = req.params.ot_id
    console.log(ot_id)
    const response =  await  pool.query('SELECT * FROM pro_ot where ot_id=$1',[ot_id],
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 const getProOtbyProduct = async (req, res) =>{
    ot_id = req.params.product_id
    console.log(ot_id)
    const response =  await  pool.query('SELECT * FROM pro_ot where product_id=$1',[product_id],
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 const deleteProOt = async (req, res) => {
     
    const ot_id = req.params.ot_id
    const product_id = req.params.product_id
    const sql = 'DELETE FROM pro_ot WHERE ot_id = $1 and product_id=$2 '
    const values = [ot_id,product_id]
    const response = await pool.query(sql,values,
       (error, results) => {
           if(error){
               console.log('error', error)
               return res.status(500).send(error)
           }
           res.status(201).send(results)
       }  );
    
 };
 

 const postProOt = async (req, res) =>{
     
    const {ot_id,product_id, quantity,inventory_id} = req.body
    const sql = 'INSERT INTO pro_ot (ot_id,product_id,quantity,inventory_id) VALUES ($1,$2,$3,$4)'
    const values =[ ot_id,product_id,quantity,inventory_id]
    const response =  await  pool.query(sql,values,
       (error, results) => {
           if(error){
               console.log('error', error)
               return res.status(500).send(error)
           }
           res.status(201).send(results)
       });
 };

 const updateProOt= async (req,res) => {
    const {ot_id,
        product_id, quantity} = req.body

    const ot_Id = req.params.ot_Id
    const product_Id = req.params.product_Id

    
    const sql = 'UPDATE image SET ot_id=$1,product_id=$2,quantity=$3  WHERE ot_Id = $4 and product_id =$5'
     
    const values = [ot_id,product_id,quantity,ot_Id, product_Id]
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
    
    getProOtbyOt,
getProOtbyProduct,
deleteProOt,
    postProOt,
    updateProOt
 }

//  const getProOtMonthly = async (req, res) =>{
//     ot_id = req.params.ot_id
//     console.log(ot_id)
//     const response =  await  pool.query('SELECT * FROM pro_ot where ot_id=$1',[ot_id],
//     (error, results) => {
//         if(error){
//             console.log('error', error)
//             return res.status(500).send(error)
//         }
//        return  res.status(201).send(results.rows)
       
//     });
   
//  };