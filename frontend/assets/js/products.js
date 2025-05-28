class ProductsPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadProducts();
        this.hideLoading();
        this.renderProducts();
        this.setupFilters();
    }

    showLoading() {
        const container = document.querySelector('.products-grid');
        if (container) {
            container.innerHTML = '<div class="loading">Loading products...</div>';
        }
    }

    hideLoading() {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    async loadProducts() {
        try {
            this.products = await window.groceryApp.fetchAPI('/products');
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Failed to load products:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    }

    renderProducts() {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = '<p class="loading">No products found.</p>';
            return;
        }

        // Clear container first
        container.innerHTML = '';

        // Create product cards
        this.filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            container.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        img.className = 'product-image loading';
        img.loading = 'lazy';

        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };

        img.onerror = () => {
            if (!img.dataset.fallbackAttempted) {
                img.dataset.fallbackAttempted = 'true';
                img.src = `${window.groceryApp.baseURL}/placeholder/300/200?text=${encodeURIComponent(product.name)}`;
            }
        };

        imageContainer.appendChild(img);

        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';
        productInfo.innerHTML = `
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-description">${product.description}</p>
            <button class="btn" onclick="window.groceryApp.addToCart(${product.id})">
                Add to Cart
            </button>
        `;

        card.appendChild(imageContainer);
        card.appendChild(productInfo);

        return card;
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(p => p.category === category);
        }
        
        this.renderProducts();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to be ready
    const initProducts = () => {
        if (window.groceryApp) {
            new ProductsPage();
        } else {
            setTimeout(initProducts, 100);
        }
    };
    initProducts();
});
