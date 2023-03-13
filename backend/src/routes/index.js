const { Router } = require('express')
const router = Router();
const {getConductors, postConductors,getConductorById,deleteConductorById,updateConductor} = require('../controllers/index.controller')
const {getInventories} = require('../controllers/movil.controller')

//Conductores
router.get('/conductors', getConductors)
router.get('/conductors/:conductor_id', getConductorById)
router.post('/conductors', postConductors)
router.delete('/conductors/:conductor_id',deleteConductorById)
router.put('/conductors/:conductor_id',updateConductor)

//Inventario
router.get('/movil', getInventories)

module.exports = router

