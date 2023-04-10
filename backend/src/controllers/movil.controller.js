const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})


const getMovils = async (req, res) =>{
    const response =  await  pool.query('SELECT * FROM movil',
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const postMovil = async (req, res) =>{
     
     const {movil_id, inventory_id,movil_observations, movil_type} = req.body
     const sql = 'INSERT INTO movil (movil_id, inventory_id,movil_observations, movil_type) VALUES ($1,$2,$3,$4)'
     const values =[movil_id, inventory_id,movil_observations, movil_type]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });


     
  };
 
  const getMovilById = async (req,res) => {
     const response =  await  pool.query('SELECT * FROM movil where movil_id = $1',[req.params.movil_id],
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };
 
  //endpoint delete conductor, solo se borra este, ningun otro dato asociado al mismo (en otra tabla).
  const deleteMovilById = async (req, res) => {
     
     const movil_id = req.params.movil_id
     const sql = 'DELETE FROM movil where movil_id = $1'
     const values = [movil_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        }  );
     
  };
 
  const updateMovil = async (req,res) => {
    const { movil_id, inventory_id,movil_state,movil_observations, movil_type} = req.body
    const movil_Id = req.params.movil_Id
    const values =[movil_id, inventory_id,movil_state,movil_observations, movil_type, movil_Id]
    const sql = 'UPDATE movil SET movil_id = $1, inventory_id=$2,movil_state = $3 ,movil_observations=$4, movil_type =$5  WHERE movil_id = $6'
     
    
      await pool.query(sql, values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        } );
     
    
 
  }

  const getMovilOc = async(req,res) => {
    const type = 'OBRA CIVIL'
    sql = `SELECT mo.movil_id, co.name FROM movil mo  LEFT JOIN conductor co ON co.movil_id = mo.movil_id WHERE mo.movil_type = '${type}'`;
    
    console.log("🚀 ~ file: movil.controller.js:98 ~ getMovilOc ~ sql:", sql)
    await pool.query(sql, 
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        } );


  }
 
 
 
 module.exports = {
    getMovils,
    postMovil,
    getMovilById,
    deleteMovilById,
    updateMovil,
    getMovilOc
   
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