// backend/routes/products.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../utils/memoryStore');

router.get('/', (req, res) => {
    const products = memoryStore.getProducts();
    const { category } = req.query;
    
    if (category) {
        const filteredProducts = products.filter(p => p.category === category);
        return res.json(filteredProducts);
    }
    
    res.json(products);
});

router.get('/:id', (req, res) => {
    const product = memoryStore.getProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

module.exports = router;
