const express = require('express')
const router = express.Router();
const { registerCustomer, loginCustomer, getProfile, logoutCustomer } = require('../controllers/customer.controller')
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', registerCustomer)
router.post('/login', loginCustomer)
router.get('/me', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logoutCustomer);



module.exports = router;