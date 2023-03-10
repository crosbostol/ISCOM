const { Router } = require('express')
const router = Router();

router.get('/conductors',(req, res) =>{
    res.send('conductors')
})



module.exports = router

