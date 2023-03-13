const { Router } = require('express')
const router = Router();
const {getConductors, postConductors,getConductorById,deleteConductorById,updateConductor} = require('../controllers/index.controller')
const {getMovils,postMovil,getMovilById,deleteMovilById,updateMovil} = require('../controllers/movil.controller')

//Conductores
router.get('/conductors', getConductors)
router.get('/conductors/:conductor_id', getConductorById)
router.post('/conductors', postConductors)
router.delete('/conductors/:conductor_id',deleteConductorById)
router.put('/conductors/:conductor_id',updateConductor)

//Moviles
router.get('/movil', getMovils)
router.get('/movil/:movil_id',getMovilById)
router.post('/movil',postMovil)
router.delete('/movil/:movil_id',deleteMovilById)
router.put('/movil/:movil_Id',updateMovil)


module.exports = router

