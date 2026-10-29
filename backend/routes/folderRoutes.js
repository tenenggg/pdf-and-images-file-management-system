import { Router } from 'express';
import * as folderController from '../controllers/folderController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/tree', folderController.getTree);
router.get('/:id/contents', folderController.getContents);
router.post('/', requireRole('admin'), folderController.createFolder);
router.patch('/:id', requireRole('admin'), folderController.renameFolder);
router.delete('/:id', requireRole('admin'), folderController.deleteFolder);
router.post('/:id/move', requireRole('admin'), folderController.moveFolder);

export default router;
