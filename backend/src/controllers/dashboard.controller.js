const {Pool}= require('pg')

const pool = new Pool({
    host: 'localhost',
    user:'postgres',
    password:'tobal2.3',
    database:'TTDB',
    port: '5432'

})

 const getMonthValue = async(req,res) => {
    date1 = req.params.date1
    date2 = req.params.date2
    values=[date1,date2]
    sql = 'SELECT SUM(itm_ot.quantity * item.item_value) AS total_value FROM itm_ot JOIN item ON itm_ot.item_id = item.item_id WHERE itm_ot.created_at >= $1 AND itm_ot.created_at <= $2;'
    const response = await pool.query(sql,values,
        (error, results) => {
          if(error){
            console.log('error', error)
            return res.status(500).send(error)
          }
          return  res.status(201).send(results.rows)
     
    } )
     }



getTotalOfItem = async(req,res) => {
  const  sql= 'SELECT i.item_id, i.description, COUNT(*) AS repetition_count, SUM(io.quantity) AS total_quantity FROM item AS i JOIN itm_ot AS io ON i.item_id = io.item_id GROUP BY i.item_id, i.description ORDER BY repetition_count DESC'
  
  const response = await pool.query(sql,
    (error, results) => {
      if(error){
        console.log('error', error)
        return res.status(500).send(error)
      }
      return  res.status(201).send(results)
  
  } )
  }
  monthlyYield = async(req,res) => {
    const sql='SELECT ot.hydraulic_movil_id, COUNT(itm_ot.item_id) AS item_count FROM ot INNER JOIN itm_ot ON ot.ot_id = itm_ot.ot_id GROUP BY ot.hydraulic_movil_id'
    
    const response = await pool.query(sql,
      (error, results) => {
        if(error){
          console.log('error', error)
          return res.status(500).send(error)
        }
        return  res.status(201).send(results)
    
    } )
    }


     module.exports = {
        getMonthValue,
        getTotalOfItem,
        monthlyYield
     }









