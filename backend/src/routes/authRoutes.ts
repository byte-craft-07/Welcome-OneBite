import { Router } from 'express';
import { login, pinLogin, getMe, updatePin } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/pin-login', pinLogin);
router.get('/me', authenticateToken, getMe);
router.put('/pin', authenticateToken, updatePin);

export default router;
