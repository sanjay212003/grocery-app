// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../utils/memoryStore');

router.get('/:userId', (req, res) => {
    const cart = memoryStore.getCart(req.params.userId);
    const cartWithProducts = cart.map(item => {
        const product = memoryStore.getProductById(item.productId);
        return {
            ...item,
            product
        };
    });
    res.json(cartWithProducts);
});

router.post('/:userId/add', (req, res) => {
    const { productId, quantity } = req.body;
    const cart = memoryStore.addToCart(req.params.userId, productId, quantity);
    res.json(cart);
});

router.delete('/:userId/remove/:productId', (req, res) => {
    const cart = memoryStore.removeFromCart(req.params.userId, req.params.productId);
    res.json(cart);
});

router.delete('/:userId/clear', (req, res) => {
    const cart = memoryStore.clearCart(req.params.userId);
    res.json(cart);
});

module.exports = router;
