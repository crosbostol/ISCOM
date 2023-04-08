const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

const getOt = async (req, res) =>{
    const response =  await  pool.query('SELECT * FROM ot',
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };
 
 const postOt = async (req, res) =>{
     
     const {ot_id, street,number_street, commune, fuga_location} = req.body
     
     const sql = 'INSERT INTO ot (ot_id, street,number_street, commune, fuga_location) VALUES ($1,$2,$3,$4,$5)'
     const values =[ot_id, street,number_street, commune, fuga_location]
     const response =  await  pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            res.status(201).send(results)
        });


     
  };
 
  const getOtById = async (req,res) => {
     const response =  await  pool.query('SELECT * FROM ot where ot_id = $1',[req.params.ot_id],
     (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
    
    
  };
 
  //endpoint delete conductor, solo se borra este, ningun otro dato asociado al mismo (en otra tabla).
  const RejectOtById = async (req, res) => {
     let msg ={}
     const ot_id = req.params.ot_id
     const sql = 'UPDATE ot SET dismissed = TRUE WHERE ot_id=$1 and dismissed=false'
     const values = [ot_id]
     const response = await pool.query(sql,values,
        (error, results) => {
            if(error){
                console.log('error', error)
                return res.status(500).send(error)
            }
            if(results.rowCount == 0){
               
               return res.json({
                    message: `Ot ${ot_id} ya está desetimada`,
                    body: {
                        user:{ot_id}
                    }
                })
             
            }
           else return res.status(201).send(results)
        }  );
     
  };
 
//SIEMPRE ENVIAR OT_ID DE LOS ULTIMOS
  const updateOt = async (req,res) => {
    ot_id = req.params.ot_id
    const fields = Object.keys(req.body);
    const values = [];
    for(const field of fields) {
      const value = req.body[field];
      if(value) {
        values.push(value);
      }
    }
     columnas = fields => {
        return fields.map((e,i) => e+ `=$${i+1}`);
     }
     totalLenght = fields.length + 1
    const fullQuery = `UPDATE ot SET ${columnas(fields)} where ot_id=$${totalLenght}`;
     values2 = values.push(ot_id)
    pool.query(
      fullQuery,
      values,
      (error, results) => {
        if (error) {
          console.log('err', error);
          return res.status(500).send(error);
        }
        res.status(201).send(results);
      }
    );
     

    
 
  }

 const getFinishedOtsByRangeDate = async (req, res) =>{
    from = req.params.date_start
    until = req.params.date_finished
    values = [from,until]
    console.log(values)
    sql ='SELECT * FROM ot WHERE "dismissed"=false and finished_at between $1 and $2 '
    const response =  await  pool.query(sql,values,
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };

 const getOtsByState = async (req, res) =>{
    state = req.params.state
  
    values = [state]
    
    sql ='SELECT * FROM ot WHERE ot_state = $1 '
    const response =  await  pool.query(sql,values,
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });
   
 };


 const getRejectedOts = async (req, res) =>{
    const response =  await  pool.query('SELECT * FROM ot WHERE "dismissed"=TRUE',
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return  res.status(201).send(results.rows)
       
    });



 }
 
 const getInfoOtForTable = async(req,res) => {
sql=' SELECT o.ot_id, o.street, o.number_street,o.commune, o.hydraulic_movil_id,  c.name as N_hidraulico, o.civil_movil_id, c2.name as N_civil, o.ot_state FROM OT o LEFT JOIN MOVIL m1 ON o.hydraulic_movil_id = m1.movil_id LEFT JOIN MOVIL m2 ON o.civil_movil_id = m2.movil_id LEFT JOIN CONDUCTOR c ON m1.movil_id = c.movil_id  left join conductor c2 On m2.movil_id = c2.movil_id'  
const response = await pool.query(sql,
    (error, results) => {
      if(error){
        console.log('error', error)
        return res.status(500).send(error)
      }
      return  res.status(201).send(results.rows)
 
} )
 }



 module.exports = {
    getOt,
    postOt,
    getOtById,
    RejectOtById,
    updateOt,
    getFinishedOtsByRangeDate,
    getRejectedOts,
    getOtsByState,
    getInfoOtForTable
   
   
 }

