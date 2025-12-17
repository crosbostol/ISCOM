import { Router } from 'express';
import { MovilController } from '../controllers/movil.controller';

const router = Router();
const controller = new MovilController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
