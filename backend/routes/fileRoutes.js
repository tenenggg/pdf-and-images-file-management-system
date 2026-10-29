import { Router } from 'express';
import * as fileController from '../controllers/fileController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/search/query', fileController.searchFiles);
router.get('/:id/download', requireRole('admin'), fileController.downloadFile);
router.get('/:id/preview', fileController.previewFile);
router.get('/:id/meta', fileController.getFileMeta);
router.patch('/:id', requireRole('admin'), fileController.renameFile);
router.delete('/:id', requireRole('admin'), fileController.deleteFile);
router.post('/:id/move', requireRole('admin'), fileController.moveFile);

const uploadRouter = Router();
uploadRouter.use(authenticate);
uploadRouter.post('/', requireRole('admin'), upload.array('files', 20), fileController.uploadFiles);

export { router as fileRoutes, uploadRouter as uploadRoutes };
