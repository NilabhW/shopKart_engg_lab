const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
} = require('../controllers/wishlist.controller');

router.get('/', authMiddleware, getWishlist);
router.post('/:productId', authMiddleware, addToWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);
router.patch('/:productId/toggle', authMiddleware, toggleWishlist);

module.exports = router;
