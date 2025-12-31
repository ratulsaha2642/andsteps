/**
 * SHOP & COLLECTIONS LOGIC (LUXURY REVEAL ENGINE)
 */

// State tracking to ensure shop stays hidden until scrolled
let shopRevealed = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Observers for Luxury Entrance
    initCollectionsObserver();
    initShopObserver();

    // 2. Initial Render
    if (document.getElementById('product-grid')) {
        renderProducts('all');
        initFilters();
    }
});

/**
 * CORE RENDERING
 * Builds the HTML with the Quick View button restored
 */
function renderProducts(filter = 'all') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    // Soft fade transition for the container
    productGrid.style.opacity = '0';

    setTimeout(() => {
        productGrid.innerHTML = '';

        const filtered = filter === 'all'
            ? products
            : products.filter(p => p.category === filter);

        const fragment = document.createDocumentFragment();

        filtered.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card'; 
            card.innerHTML = `
                <div class="card-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="card-actions">
                        <button class="action-btn" onclick="addToCart(${product.id})" aria-label="Add to Cart">
                            <span class="material-symbols-rounded">add_shopping_cart</span>
                        </button>
                        <button class="action-btn" aria-label="Quick View">
                            <span class="material-symbols-rounded">visibility</span>
                        </button>
                    </div>
                </div>
                <div class="card-info">
                    <div class="card-cat">${product.category}</div>
                    <h3 class="card-title">${product.name}</h3>
                    <div class="card-price">$${product.price.toFixed(2)}</div>
                </div>
            `;
            fragment.appendChild(card);
        });

        productGrid.appendChild(fragment);
        
        // Ensure browser has painted the cards before fading grid back in
        requestAnimationFrame(() => {
            productGrid.style.opacity = '1';
            
            // Only trigger stagger if shop is already in view or user is filtering
            if (shopRevealed) {
                staggerReveal('.product-card');
            }
        });
    }, 250); 
}

/**
 * ORGANIC STAGGER ENGINE
 * Adds a luxury "Focus" effect to each card
 */
function staggerReveal(selector) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el, index) => {
        // Reset state for clean re-animation
        el.classList.remove('reveal-active');
        
        // Luxury timing: slightly slower stagger (140ms) for an editorial feel
        setTimeout(() => {
            requestAnimationFrame(() => {
                el.classList.add('reveal-active');
            });
        }, index * 140); 
    });
}

/**
 * INTERSECTION OBSERVERS
 */
function initCollectionsObserver() {
    const collectionsGrid = document.querySelector('.collections-grid');
    if (!collectionsGrid) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                staggerReveal('.collection-card');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(collectionsGrid);
}

function initShopObserver() {
    const shopSection = document.querySelector('#shop');
    if (!shopSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                shopRevealed = true; 

                // Reveal Shop Title and Filter Bar
                const headers = entry.target.querySelectorAll('.section-title, .filter-bar');
                headers.forEach(el => el.classList.add('reveal-active'));

                // Delay the product stagger so it flows from the top title down
                setTimeout(() => {
                    staggerReveal('.product-card');
                }, 400);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    observer.observe(shopSection);
}

/**
 * FILTER BUTTON LOGIC
 */
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.classList.contains('active')) return;

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-filter');
            renderProducts(category);
        });
    });
}