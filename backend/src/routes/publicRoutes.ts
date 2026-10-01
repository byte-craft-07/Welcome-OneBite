import { Router } from 'express';
import { getPublicBusiness } from '../controllers/businessController';
import { trackPageView, trackLinkClick } from '../controllers/analyticsController';
import { getBusinessQR } from '../controllers/qrController';

const router = Router();

router.get('/business/:slug', getPublicBusiness);
router.post('/business/:slug/view', trackPageView);
router.post('/business/:slug/links/:linkId/click', trackLinkClick);
router.get('/business/:slug/qr', getBusinessQR);

export default router;
