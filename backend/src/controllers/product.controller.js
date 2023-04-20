const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

const getProducts = async (req, res) =>{
    const product_type = 'HIDRAULICO'
    const response =  await  pool.query(`SELECT * FROM product where product_category = '${product_type}'`,
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const postProduct = async (req, res) =>{
     
     const { product_name,product_category, product_unit} = req.body
     const sql = 'INSERT INTO product ( product_name,product_category, product_unit) VALUES ($1,$2,$3)'
     const values =[ product_name,product_category, product_unit]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });


     
  };
 
  const getProductById = async (req,res) => {
     const response =  await  pool.query('SELECT * FROM product where product_id = $1',[req.params.product_id],
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };
 
  //endpoint delete conductor, solo se borra este, ningun otro dato asociado al mismo (en otra tabla).
  const deleteProductById = async (req, res) => {
     
     const product_id = req.params.product_id
     const sql = 'DELETE FROM product WHERE product_id = $1'
     const values = [product_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        }  );
     
  };
 
  const updateProduct = async (req,res) => {
    const {product_id, product_name,product_category, product_unit} = req.body
    const product_Id = req.params.product_Id
    const values =[product_id, product_name,product_category, product_unit, product_Id]
    const sql = 'UPDATE product SET product_id = $1, product_name=$2,product_category = $3 ,product_unit=$4 WHERE product_Id = $5'
     
    
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
    getProducts,
    postProduct,
    getProductById,
    deleteProductById,
    updateProduct
   
 }