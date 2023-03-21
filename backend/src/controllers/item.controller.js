const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})


const getItem = async (req, res) =>{
    const response =  await  pool.query('SELECT * FROM item',
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const postItem = async (req, res) =>{
     
     const {item_id, description,item_value, item_type,item_unit} = req.body
     const sql = 'INSERT INTO item (item_id, description,item_value, item_type,item_unit) VALUES ($1,$2,$3,$4,$5)'
     const values =[item_id, description,item_value, item_type,item_unit]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });


     
  };
 
  const getItemById = async (req,res) => {
     const response =  await  pool.query('SELECT * FROM item WHERE item_id = $1',[req.params.item_id],
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };
 
  //endpoint delete conductor, solo se borra este, ningun otro dato asociado al mismo (en otra tabla).
  const deleteItemById = async (req, res) => {
     
     const item_id = req.params.item_id
     const sql = 'DELETE FROM item WHERE item_id = $1'
     const values = [item_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        }  );
     
  };
 
  const updateItem = async (req,res) => {
    const {item_id, description,item_value,item_type,item_unit} = req.body
    console.log(req.body)
    const item_Id = req.params.item_Id
    const values =[item_id, description,item_value, item_type,item_unit, item_Id]
    const sql = 'UPDATE item SET item_id = $1, description=$2,item_value = $3 ,item_type=$4, item_unit=$5 WHERE item_Id = $6'
     
    
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
    getItem,
    postItem,
    getItemById,
    deleteItemById,
    updateItem
   
 }

//ENDPOINT POST QUE GENERA LOS CAMPOS NECESRIOS SEGUN LO QUE SE ENVIA, SUPER UTIL
//  app.post("/api/v1/cars", (req, res) => {
//     const { data } = req.body;
//     console.log('Adding', data);
  
//     const fields = Object.keys(data);
//     const columns = fields.join(", ");
//     const values = [];
//     for(const field of fields) {
//       const value = data[field];
//       if(value) {
//         values.push(value);
//       }
//     }
  
//     const fullQuery = `INSERT INTO cars (${columns}) VALUES (${values.map((v, i) => `$${i+1}`).join(", ")})`;
//     console.log('fullQuery', fullQuery);
//     console.log('values', values);
  
//     pool.query(
//       fullQuery,
//       values,
//       (error, results) => {
//         if (error) {
//           console.log('err', error);
//           return res.status(500).send(error);
//         }
//         res.status(201).send(results);
//       }
//     );
//   });