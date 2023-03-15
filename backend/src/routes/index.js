const { Router } = require('express')
const router = Router();
const {getConductors, postConductors,getConductorById,deleteConductorById,updateConductor} = require('../controllers/index.controller')
const {getMovils,postMovil,getMovilById,deleteMovilById,updateMovil} = require('../controllers/movil.controller')
const {postInventory,getInventory,deleteInventory,putInventory} = require('../controllers/inventory.controller')
const {  getProducts,postProduct,getProductById,deleteProductById,updateProduct} = require('../controllers/product.controller')
const {  getInvPro,postInvPro,getInvProById,deleteInvProById,updateInvPro,getInvProByInventoryId,getTotalOfProduct} = require('../controllers/inv-pro.controller')


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

//Inventario
router.post('/inventory',postInventory)
router.get('/inventory',getInventory)
router.delete('/inventory/:inventory_id',deleteInventory)
router.put('/inventory/:inventory_id',putInventory)

//Productos
router.get('/product', getProducts)
router.get('/product/:movil_id',getProductById )
router.post('/product',postProduct)
router.delete('/product/:product_id',deleteProductById)
router.put('/product/:product_Id',updateProduct)

//Relacion inventario producto
router.get('/invpro/get', getInvPro)// CONSEGUIR TODA LA INFORMACIÓN
router.get('/invpro/products/unique/:product_id/:inventory_id',getInvProById )//CANTIDAD DE UN PRODUCTO EN UN INVENTARIO
router.post('/invpro',postInvPro)
router.delete('/invpro/:product_id/:inventory_id',deleteInvProById)
router.put('/invpro/:product_Id/:inventory_Id',updateInvPro)
router.get('/invpro/:inventory_id',getInvProByInventoryId)//OBTENER EL INVENTARIO DE UN MOVIL
router.get('/invpro/products/:product_id',getTotalOfProduct)// TOTAL DE UN PRODUCTO ENTRE TODOS LOS INVENTARIOS




module.exports = router

