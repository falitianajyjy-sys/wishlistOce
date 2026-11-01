import { Router } from 'express';
import { giftController } from '../controllers/giftController';
import { adminAuth } from '../middlewares/adminAuth';
import { upload } from '../middlewares/upload';

export const giftRoutes = Router();

// Invités
giftRoutes.get('/gifts', giftController.listForGuest);
giftRoutes.post('/gifts/:id/claim', giftController.claim);
giftRoutes.post('/gifts/:id/release', giftController.release);

// Admin
giftRoutes.get('/admin/gifts', adminAuth, giftController.listForAdmin);
giftRoutes.post('/gifts', adminAuth, upload.single('image'), giftController.create);
giftRoutes.delete('/gifts/:id', adminAuth, giftController.remove);
giftRoutes.patch('/gifts/:id', adminAuth, giftController.updateDescription);