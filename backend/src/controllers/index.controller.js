const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

const getConductors = async (req, res) =>{
   const response =  await  pool.query('SELECT * FROM conductor',
   (error, results) => {
    if(error){
        console.log('error', error)
        return res.status(500).send(error)
    }
   return res.status(201).send(results.rows)
});
};

const postConductors = async (req, res) =>{
    
    const {conductor_id,movil_id} = req.body
    const response =  await  pool.query('INSERT INTO conductor (conductor_id, movil_id) VALUES ($1,$2)',[conductor_id,movil_id]);
    res.json({
        message: `Conductor ${conductor_id} creado correctamente`,
        body: {
            user:{conductor_id, movil_id}
        }
    })
 };

 const getConductorById = async (req,res) => {
    const response =  await  pool.query('SELECT * FROM conductor where conductor_id = $1',[req.params.conductor_id],
    (error, results) => {
        if(error){
            console.log('error', error)
            return res.status(500).send(error)
        }
       return res.status(201).send(results.rows)
    });
  
 };

 //endpoint delete conductor, solo se borra este, ningun otro dato asociado al mismo.
 const deleteConductorById = async (req, res) => {
    console.log(req.params)
    const conductor_id = req.params.conductor_id
    const movil_id = req.params.movil_id
    const response = await pool.query('DELETE FROM conductor where conductor_id = $1 ', [conductor_id]);
    res.json({
        message: `Conductor ${conductor_id} eliminado correctamente`,
        body: {
            user:{conductor_id, movil_id}
        }
    })
 };

 const updateConductor = async (req,res) => {
    const conductor_Id = req.params.conductor_id
    const { movil_id,conductor_id} = req.body
    const response = await pool.query('UPDATE conductor SET movil_id = $1, conductor_id=$2 WHERE conductor_id = $3', [movil_id,conductor_id, conductor_Id]);
    
    res.status(200).json({
        message: `Conductor ${conductor_Id} actualizado correctamente`,
        body: {
            user:{conductor_id, movil_id}
        }
    })

 }



module.exports = {
    getConductors,
    postConductors,
    getConductorById,
    deleteConductorById,
    updateConductor,
    pool
}