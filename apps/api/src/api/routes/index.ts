import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';
import { getOt, postOt, getOtById, updateOt, RejectOtById } from '../controllers/ot.controller';
import { getMonthValue, getTotalOfItem, monthlyYield } from '../controllers/dashboard.controller';
import { getImagebyOt, postImage, getImageById, deleteImageById, updateImage } from '../controllers/image.controller';

const router = Router();

// Health Check
router.get('/health', getHealth);

// OT Routes
router.get('/ot', getOt);
router.post('/ot', postOt);
router.get('/ot/:ot_id', getOtById);
router.put('/ot/:ot_id', updateOt);
router.put('/ot/reject/:ot_id', RejectOtById); // Fixed path to match legacy: /ot/reject/:ot_id

// Dashboard Routes
router.get('/dashboard/monthValue/:date1/:date2', getMonthValue);
router.get('/dashboard/totalItems', getTotalOfItem);
router.get('/dashboard/monthlyYield', monthlyYield);

// Image Routes
router.get('/image/ot/:ot_id', getImagebyOt);
router.post('/image', postImage);
router.get('/image/:image_id', getImageById);
router.delete('/image/:image_id', deleteImageById);
router.put('/image/:image_id', updateImage);

// Item Routes
import { getItem, postItem, getItemById, deleteItemById, updateItem, getItemOH, getItemOC } from '../controllers/item.controller';
router.get('/item', getItem);
router.post('/item', postItem);
router.get('/item/:item_id', getItemById);
router.delete('/item/:item_id', deleteItemById);
router.put('/item/:item_Id', updateItem);
router.get('/item-oh', getItemOH);
router.get('/item-oc', getItemOC);

// Product Routes
import { getProducts, postProduct, getProductById, deleteProductById, updateProduct } from '../controllers/product.controller';
router.get('/product', getProducts);
router.post('/product', postProduct);
router.get('/product/:product_id', getProductById);
router.delete('/product/:product_id', deleteProductById);
router.put('/product/:product_Id', updateProduct);

// Inventory Routes
import { postInventory, getInventory, getUniqueInventories, getInventoryById, deleteInventory, putInventory } from '../controllers/inventory.controller';
router.post('/inventory', postInventory);
router.get('/inventory', getInventory);
router.get('/inventory/unique', getUniqueInventories);
router.get('/inventory/:inventory_id', getInventoryById);
router.delete('/inventory/:inventory_id', deleteInventory);
router.put('/inventory/:inventory_id', putInventory);

// InvPro Routes
import { getInvPro, postInvPro, getInvProById, deleteInvProById, updateInvPro, getInvProByInventoryId, getTotalOfProduct, getProductsNotInInventory } from '../controllers/inv-pro.controller';
router.get('/invpro/get', getInvPro);
router.get('/invpro/products/unique/:product_id/:inventory_id', getInvProById);
router.post('/invpro', postInvPro);
router.delete('/invpro/:product_id/:inventory_id', deleteInvProById);
router.put('/invpro/:product_Id/:inventory_Id', updateInvPro);
router.get('/invpro/:inventory_id', getInvProByInventoryId);
router.get('/invpro/products/:product_id', getTotalOfProduct);
router.get('/invpro/products/not-in/:inventory_id', getProductsNotInInventory);

// ItmOt Routes
import { getItmOt, getItmByOt, postItmOt, deleteItmOtById, updateItmOt } from '../controllers/ot-item.controller';
router.get('/itmot', getItmOt);
router.get('/itmot/:ot_id', getItmByOt);
router.post('/itmot', postItmOt);
router.delete('/itmot/:item_id/:ot_id', deleteItmOtById);
router.put('/itmot/:item_Id/:ot_Id', updateItmOt);

// ProOt Routes
import { getProOtbyOt, getProOtbyProduct, deleteProOt, postProOt, updateProOt } from '../controllers/pro-ot.controller';
router.get('/pro-ot/ot/:ot_id', getProOtbyOt);
router.get('/pro-ot/product/:product_id', getProOtbyProduct);
router.delete('/pro-ot/:ot_id/:product_id', deleteProOt);
router.post('/pro-ot/', postProOt);
router.put('/pro-ot/:ot_id/:product_id', updateProOt);

// Movil Routes
import { getMovils, postMovil, getMovilById, deleteMovilById, updateMovil, getMovilOc } from '../controllers/movil.controller';
router.get('/movil', getMovils);
router.get('/movil/:movil_id', getMovilById);
router.post('/movil', postMovil);
router.delete('/movil/:movil_id', deleteMovilById);
router.put('/movil/:movil_Id', updateMovil);
router.get('/movil/get/oc', getMovilOc);

// Conductor Routes
import { getConductors, postConductors, getConductorById, deleteConductorById, updateConductor } from '../controllers/conductor.controller';
router.get('/conductors', getConductors);
router.get('/conductors/:conductor_id', getConductorById);
router.post('/conductors', postConductors);
router.delete('/conductors/:conductor_id', deleteConductorById);
router.put('/conductors/:conductor_id', updateConductor);

// Placeholder for other routes (to be migrated)
// router.use('/users', userRoutes);

export default router;
