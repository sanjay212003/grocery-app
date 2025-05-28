// backend/utils/memoryStore.js
class MemoryStore {
    constructor() {
        this.data = new Map();
        this.cart = new Map();
    }

    // Product operations
    setProducts(products) {
        this.data.set('products', products);
    }

    getProducts() {
        return this.data.get('products') || [];
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === parseInt(id));
    }

    // Cart operations
    addToCart(userId, productId, quantity) {
        const userCart = this.cart.get(userId) || [];
        const existingItem = userCart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            userCart.push({ productId, quantity, addedAt: new Date() });
        }
        
        this.cart.set(userId, userCart);
        return userCart;
    }

    getCart(userId) {
        return this.cart.get(userId) || [];
    }

    removeFromCart(userId, productId) {
        const userCart = this.cart.get(userId) || [];
        const updatedCart = userCart.filter(item => item.productId !== productId);
        this.cart.set(userId, updatedCart);
        return updatedCart;
    }

    clearCart(userId) {
        this.cart.set(userId, []);
        return [];
    }
}

module.exports = new MemoryStore();
