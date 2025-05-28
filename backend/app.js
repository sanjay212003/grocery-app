// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const memoryStore = require('./utils/memoryStore');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/images', express.static(path.join(__dirname, '../frontend/assets/images')));
app.use('/icons', express.static(path.join(__dirname, '../frontend/assets/icons')));

// Serve backend public files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Initialize sample data with proper image URLs
const sampleProducts = [
    {
        id: 1,
        name: "Fresh Bananas",
        price: 2.99,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop&crop=center",
        description: "Fresh organic bananas, perfect for smoothies and snacks",
        inStock: true,
        weight: "1 bunch",
        stock: 50
    },
    {
        id: 2,
        name: "Whole Milk",
        price: 3.49,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop&crop=center",
        description: "Fresh whole milk 1L, locally sourced",
        inStock: true,
        weight: "1L",
        stock: 30
    },
    {
        id: 3,
        name: "Artisan Bread Loaf",
        price: 2.29,
        category: "bakery",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop&crop=center",
        description: "Fresh baked artisan bread, made daily",
        inStock: true,
        weight: "500g",
        stock: 25
    },
    {
        id: 4,
        name: "Chicken Breast",
        price: 8.99,
        category: "meat",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop&crop=center",
        description: "Fresh chicken breast, hormone-free",
        inStock: true,
        weight: "1kg",
        stock: 20
    },
    {
        id: 5,
        name: "Roma Tomatoes",
        price: 4.99,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300&h=200&fit=crop&crop=center",
        description: "Fresh red Roma tomatoes, perfect for cooking",
        inStock: true,
        weight: "1kg",
        stock: 40
    },
    {
        id: 6,
        name: "Green Apples",
        price: 3.99,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop&crop=center",
        description: "Crisp green apples, great for snacking",
        inStock: true,
        weight: "1kg",
        stock: 35
    },
    {
        id: 7,
        name: "Cheddar Cheese",
        price: 5.99,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop&crop=center",
        description: "Aged cheddar cheese, rich and creamy",
        inStock: true,
        weight: "200g",
        stock: 15
    },
    {
        id: 8,
        name: "Fresh Carrots",
        price: 2.49,
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=200&fit=crop&crop=center",
        description: "Fresh organic carrots, perfect for cooking",
        inStock: true,
        weight: "1kg",
        stock: 45
    },
    {
        id: 9,
        name: "Greek Yogurt",
        price: 4.29,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop&crop=center",
        description: "Creamy Greek yogurt, high in protein",
        inStock: true,
        weight: "500g",
        stock: 25
    },
    {
        id: 10,
        name: "Fresh Salmon",
        price: 12.99,
        category: "meat",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center",
        description: "Fresh Atlantic salmon fillet",
        inStock: true,
        weight: "500g",
        stock: 12
    }
];

// Initialize memory store with products
memoryStore.setProducts(sampleProducts);

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

// Placeholder image generator for missing images
app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    const text = req.query.text || 'Image';
    
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
                  fill="#6c757d" text-anchor="middle" dy=".3em">${text}</text>
        </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        products: memoryStore.getProducts().length
    });
});

// API endpoint to get categories
app.get('/api/categories', (req, res) => {
    const products = memoryStore.getProducts();
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

// Serve frontend pages with proper error handling
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/products', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/pages/products.html'));
    } catch (error) {
        console.error('Error serving products.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/cart', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/pages/cart.html'));
    } catch (error) {
        console.error('Error serving cart.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/about', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/pages/about.html'));
    } catch (error) {
        console.error('Error serving about.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/contact', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../frontend/pages/contact.html'));
    } catch (error) {
        console.error('Error serving contact.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle 404 for undefined routes
app.get('*', (req, res) => {
    // If it's an API request, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For other requests, redirect to home page
    res.redirect('/');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    if (req.path.startsWith('/api/')) {
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
        });
    } else {
        res.status(500).send('Internal Server Error');
    }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// backend/app.js - Add this at the end before app.listen()
if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, '../frontend')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
    });
}

// Export the app for Vercel
module.exports = app;


// Start server
app.listen(PORT, () => {
    console.log(`🚀 FreshMart Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💾 Products loaded: ${memoryStore.getProducts().length}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
