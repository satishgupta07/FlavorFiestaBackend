import express from 'express';
import { getCurrentLoginUser, loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', auth, logoutUser);
router.get('/getCurrentUser', auth, getCurrentLoginUser);

export default router;