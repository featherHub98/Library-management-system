import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { validateSignup, validateLogin, validateResetPassword } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', validateSignup, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot', validateResetPassword, AuthController.forgotPassword);
router.post('/reset', AuthController.resetPassword);

router.get('/health', (req, res) => res.send('OK'));

export default router;