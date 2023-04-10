const { Router } = require('express')
const router = Router();
const {getConductors, postConductors,getConductorById,deleteConductorById,updateConductor} = require('../controllers/index.controller')
const {getMovils,postMovil,getMovilById,deleteMovilById,updateMovil,getMovilOc} = require('../controllers/movil.controller')
const {postInventory,getInventory,deleteInventory,putInventory,getInventoryById,getUniqueInventories} = require('../controllers/inventory.controller')
const {  getProducts,postProduct,getProductById,deleteProductById,updateProduct} = require('../controllers/product.controller')
const {  getInvPro,postInvPro,getInvProById,deleteInvProById,updateInvPro,getInvProByInventoryId,getTotalOfProduct,getProductsNotInInventory} = require('../controllers/inv-pro.controller')
const { getItem,postItem,getItemById,deleteItemById,updateItem} = require('../controllers/item.controller')
const {  getItmOt,getItmByOt,postItmOt,deleteItmOtById,updateItmOt} = require('../controllers/ot-item.controller')
const {getOt,postOt,getOtById,RejectOtById,updateOt,getFinishedOtsByRangeDate,getRejectedOts,getOtsByState,getInfoOtForTable} = require('../controllers/ot.controller')
const { getImagebyOt,postImage,getImageById,deleteImageById,updateImage} = require('../controllers/image.controller')
const {getProOtbyOt,
    getProOtbyProduct,
    deleteProOt,
        postProOt,
        updateProOt} = require('../controllers/pro-ot.controller')
//ot-pro
router.get('/pro-ot/ot/:ot_id',getProOtbyOt)
router.get('/pro-ot/product/:product_id',getProOtbyProduct)
router.delete('/pro-ot/:ot_id/:product_id',deleteProOt)
router.post('/pro-ot/',postProOt)
router.put('/pro-ot/:ot_id/:product_id',updateProOt)

//images
router.get('/image/ot/:ot_id',getImagebyOt)
router.post('/image',postImage)
router.get('/image/:image_id',getImageById)
router.delete('/image/:image_id',deleteImageById)
router.put('/image/:image_id',updateImage)


//ot
router.put('/ot/reject/:ot_id',RejectOtById)
router.put('/ot/:ot_id',updateOt)
router.get('/ot/finished/:date_start/:date_finished',getFinishedOtsByRangeDate)
router.get('/ot/rejected',getRejectedOts)
router.get('/ot',getOt)
router.post('/ot',postOt)
router.get('/ot/:ot_id',getOtById)
router.get('/ot/state/:state',getOtsByState)
router.get('/ottable',getInfoOtForTable)

//Relacion item ot
router.get('/itmot',getItmOt)
router.get('/itmot/:ot_id',getItmByOt)
router.post('/itmot',postItmOt)
router.delete('/itmot/:item_id/:ot_id',deleteItmOtById)
router.put('/itmot/:item_Id/:ot_Id',updateItmOt)



//Partidas
router.get('/item', getItem)
router.get('/item/:item_id',getItemById)
router.post('/item',postItem)
router.delete('/item/:item_id',deleteItemById)
router.put('/item/:item_Id',updateItem)

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
router.get('/movil/get/oc',getMovilOc)

//Inventario
router.post('/inventory',postInventory)
router.get('/inventory',getInventory)
router.get('/inventory/unique',getUniqueInventories)
router.get('/inventory/:inventory_id',getInventoryById)
router.delete('/inventory/:inventory_id',deleteInventory)
router.put('/inventory/:inventory_id',putInventory)

//Productos
router.get('/product', getProducts)
router.get('/product/:product_id',getProductById )
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
router.get('/invpro/products/not-in/:inventory_id',getProductsNotInInventory)



module.exports = router

