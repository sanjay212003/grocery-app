class GroceryApp {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.userId = 'user123';
        this.cart = [];
        this.imageCache = new Map();
        this.init();
    }

    async init() {
        try {
            await this.loadCart();
            this.updateCartCount();
            this.setupEventListeners();
            this.preloadImages();
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    setupEventListeners() {
        // Handle image loading globally
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);

        // Handle image load success
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageLoad(e.target);
            }
        }, true);
    }

    handleImageError(img) {
        if (!img.dataset.fallbackAttempted) {
            img.dataset.fallbackAttempted = 'true';
            img.src = `${this.baseURL}/placeholder/300/200?text=Image+Not+Found`;
        }
    }

    handleImageLoad(img) {
        img.classList.remove('loading');
        img.classList.add('loaded');
    }

    async preloadImages() {
        try {
            const products = await this.fetchAPI('/products');
            const imagePromises = products.map(product => this.preloadImage(product.image));
            await Promise.allSettled(imagePromises);
        } catch (error) {
            console.warn('Image preloading failed:', error);
        }
    }

    preloadImage(src) {
        return new Promise((resolve) => {
            if (this.imageCache.has(src)) {
                resolve();
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.imageCache.set(src, true);
                resolve();
            };
            img.onerror = () => {
                this.imageCache.set(src, false);
                resolve();
            };
            img.src = src;
        });
    }

    async fetchAPI(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            this.showError('Something went wrong. Please try again.');
            throw error;
        }
    }

    async loadCart() {
        try {
            this.cart = await this.fetchAPI(`/cart/${this.userId}`);
        } catch (error) {
            this.cart = [];
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            await this.fetchAPI(`/cart/${this.userId}/add`, {
                method: 'POST',
                body: JSON.stringify({ productId, quantity })
            });
            
            await this.loadCart();
            this.updateCartCount();
            this.showSuccess('Item added to cart!');
        } catch (error) {
            this.showError('Failed to add item to cart');
        }
    }

    async removeFromCart(productId) {
        try {
            await this.fetchAPI(`/cart/${this.userId}/remove/${productId}`, {
                method: 'DELETE'
            });
            
            await this.loadCart();
            this.updateCartCount();
            this.showSuccess('Item removed from cart!');
        } catch (error) {
            this.showError('Failed to remove item from cart');
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    createImageElement(src, alt, className = '') {
        const container = document.createElement('div');
        container.className = 'image-container';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = `product-image loading ${className}`;
        img.loading = 'lazy';
        
        container.appendChild(img);
        return container;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.groceryApp = new GroceryApp();
});
