import { Router } from 'express';
import {
  getAdminBusinesses,
  getAdminBusiness,
  createBusiness,
  updateBusiness,
} from '../controllers/businessController';
import {
  getAdminLinks,
  createLink,
  updateLink,
  deleteLink,
  duplicateLink,
  toggleLinkActive,
  reorderLinks,
} from '../controllers/linkController';
import { getHours, updateHours } from '../controllers/hoursController';
import { getAppearance, updateAppearance } from '../controllers/appearanceController';
import { getAnalytics } from '../controllers/analyticsController';
import { handleFileUpload } from '../controllers/uploadController';
import { upload } from '../middleware/upload';

const router = Router();

// Business Profile
router.get('/businesses', getAdminBusinesses);
router.post('/businesses', createBusiness);
router.get('/business', getAdminBusiness);
router.put('/business', updateBusiness);

// Links CRUD & Reordering
router.get('/links', getAdminLinks);
router.post('/links', createLink);
router.put('/links/reorder', reorderLinks);
router.put('/links/:id', updateLink);
router.delete('/links/:id', deleteLink);
router.post('/links/:id/duplicate', duplicateLink);
router.patch('/links/:id/toggle', toggleLinkActive);

// Business Hours
router.get('/hours', getHours);
router.put('/hours', updateHours);

// Appearance
router.get('/appearance', getAppearance);
router.put('/appearance', updateAppearance);

// Analytics
router.get('/analytics', getAnalytics);

// File Upload
router.post('/upload', upload.single('image'), handleFileUpload);

export default router;
