const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})


const getImagebyOt = async (req, res) =>{
    ot_id = req.params.ot_id
    console.log(ot_id)
    const response =  await  pool.query('SELECT * FROM image where ot_id=$1',[ot_id],
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const postImage = async (req, res) =>{
     
     const {url, ot_id} = req.body
     const sql = 'INSERT INTO Image (url, ot_id) VALUES ($1,$2)'
     const values =[url, ot_id]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });
  };
 
  const getImageById = async (req,res) => {
     const response =  await  pool.query('SELECT * FROM item WHERE image_id = $1',[req.params.image_id],
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };
 
  //endpoint delete conductor, solo se borra este, ningun otro dato asociado al mismo (en otra tabla).
  const deleteImageById = async (req, res) => {
     
     const image_id = req.params.image_id
     const sql = 'DELETE FROM IMAGE WHERE image_id = $1'
     const values = [image_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        }  );
     
  };
 
  const updateImage= async (req,res) => {
    const {url} = req.body
    
    const image_id = req.params.image_id
    const values =[url, image_id]
    console.log(values)
    const sql = 'UPDATE image SET url=$1 WHERE image_id = $2'
     
    
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
    
    getImagebyOt,
    postImage,
    getImageById,
    deleteImageById,
    updateImage
 }