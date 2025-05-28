class CartPage {
    constructor() {
        this.cart = [];
        this.init();
    }

    async init() {
        await this.loadCart();
        this.renderCart();
        this.setupEventListeners();
    }

    async loadCart() {
        try {
            this.cart = await window.groceryApp.fetchAPI(`/cart/${window.groceryApp.userId}`);
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.cart = [];
        }
    }

    renderCart() {
        const container = document.querySelector('.cart-items');
        const summaryContainer = document.querySelector('.cart-summary');
        
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <a href="/products" class="btn">Continue Shopping</a>
                </div>
            `;
            if (summaryContainer) summaryContainer.style.display = 'none';
            return;
        }

        // Clear container first
        container.innerHTML = '';

        // Create cart items
        this.cart.forEach(item => {
            const cartItem = this.createCartItem(item);
            container.appendChild(cartItem);
        });

        this.renderSummary();
    }

    createCartItem(item) {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.setAttribute('data-product-id', item.productId);

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        const img = document.createElement('img');
        img.src = item.product.image;
        img.alt = item.product.name;
        img.className = 'product-image loading';

        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };

        img.onerror = () => {
            if (!img.dataset.fallbackAttempted) {
                img.dataset.fallbackAttempted = 'true';
                img.src = `${window.groceryApp.baseURL}/placeholder/80/80?text=${encodeURIComponent(item.product.name)}`;
            }
        };

        imageContainer.appendChild(img);

        const cartItemInfo = document.createElement('div');
        cartItemInfo.className = 'cart-item-info';
        cartItemInfo.innerHTML = `
            <h4 class="cart-item-name">${item.product.name}</h4>
            <p class="cart-item-price">$${item.product.price.toFixed(2)}</p>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="cartPage.updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="cartPage.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
            </div>
            <p class="item-total">Total: $${(item.product.price * item.quantity).toFixed(2)}</p>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => this.removeItem(item.productId);

        cartItemDiv.appendChild(imageContainer);
        cartItemDiv.appendChild(cartItemInfo);
        cartItemDiv.appendChild(removeBtn);

        return cartItemDiv;
    }

    renderSummary() {
        const summaryContainer = document.querySelector('.cart-summary');
        if (!summaryContainer) return;

        const total = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        summaryContainer.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Items (${itemCount}):</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>$5.99</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${(total + 5.99).toFixed(2)}</span>
            </div>
            <button class="btn checkout-btn" onclick="cartPage.checkout()">Proceed to Checkout</button>
            <button class="btn btn-secondary" onclick="cartPage.clearCart()">Clear Cart</button>
        `;

        summaryContainer.style.display = 'block';
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            await this.removeItem(productId);
            return;
        }

        try {
            await window.groceryApp.removeFromCart(productId);
            await window.groceryApp.addToCart(productId, newQuantity);
            await this.loadCart();
            this.renderCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    }

    async removeItem(productId) {
        try {
            await window.groceryApp.removeFromCart(productId);
            await this.loadCart();
            this.renderCart();
            window.groceryApp.updateCartCount();
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }

    async clearCart() {
        try {
            await window.groceryApp.fetchAPI(`/cart/${window.groceryApp.userId}/clear`, {
                method: 'DELETE'
            });
            await this.loadCart();
            this.renderCart();
            window.groceryApp.updateCartCount();
            window.groceryApp.showSuccess('Cart cleared!');
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            window.groceryApp.showError('Your cart is empty!');
            return;
        }
        
        window.groceryApp.showSuccess('Order placed successfully! Thank you for shopping with us.');
        setTimeout(() => {
            this.clearCart();
        }, 2000);
    }

    setupEventListeners() {
        // Additional event listeners can be added here
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const initCart = () => {
        if (window.groceryApp) {
            window.cartPage = new CartPage();
        } else {
            setTimeout(initCart, 100);
        }
    };
    initCart();
});
