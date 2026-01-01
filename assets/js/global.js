/**
 * AeroStride Shoe Store - Optimized Logic Script
 * Features: Persistent Cart, Dynamic Rendering, and Smart Navigation Observer
 */

// ==========================================
// 1. GLOBAL DATA & STATE
// ==========================================
window.products = []; 
window.cart = JSON.parse(localStorage.getItem('andStepCart')) || [];

async function loadProducts() {
    try {
        const response = await fetch('assets/products.json');
        window.products = await response.json();
        // Render only if the grid exists on the current page
        if (document.getElementById('product-grid')) window.renderProducts();
    } catch (error) {
        console.error("Error loading products:", error);
        const grid = document.getElementById('product-grid');
        if (grid) grid.innerHTML = '<p>Unable to load products. Please try again later.</p>';
    }
}

// ==========================================
// 2. CORE CART LOGIC
// ==========================================
window.saveCart = () => localStorage.setItem('andStepCart', JSON.stringify(window.cart));

window.addToCart = function (id) {
    const product = window.products.find(p => p.id === id);
    const existing = window.cart.find(item => item.id === id);
    existing ? existing.qty++ : window.cart.push({ ...product, qty: 1 });
    window.saveCart();
    updateCartUI();
    window.openCart();
};

window.removeFromCart = function (id) {
    window.cart = window.cart.filter(item => item.id !== id);
    window.saveCart();
    updateCartUI();
};

window.updateQuantity = function(id, change) {
    const item = window.cart.find(p => p.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) window.cart = window.cart.filter(p => p.id !== id);
        window.saveCart();
        updateCartUI();
    }
};

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');
    const cartCountEl = document.querySelector('.cart-count');
    const checkoutButtons = document.querySelectorAll('.cart-footer .btn-primary, #checkout-btn');

    if (!cartItemsContainer || !cartCountEl) return;

    const count = window.cart.reduce((acc, item) => acc + item.qty, 0);
    cartCountEl.textContent = count;
    cartCountEl.style.opacity = count > 0 ? '1' : '0';

    checkoutButtons.forEach(btn => btn.classList.toggle('cart-empty', window.cart.length === 0));

    if (window.cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your bag is empty.</div>';
        if (cartTotalEl) cartTotalEl.textContent = '$0.00';
    } else {
        cartItemsContainer.innerHTML = window.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="qty-controls">
                        <button onclick="window.updateQuantity(${item.id}, -1)" class="qty-btn">−</button>
                        <span class="qty-val">${item.qty}</span>
                        <button onclick="window.updateQuantity(${item.id}, 1)" class="qty-btn">+</button>
                    </div>
                    <p class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</p>
                    <button class="remove-btn" onclick="window.removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
        const total = window.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
    }
}

// ==========================================
// 3. PRODUCT GRID RENDERING
// ==========================================
window.renderProducts = function(filter = 'all') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = ''; 
    const filtered = filter === 'all' ? window.products : window.products.filter(p => p.category === filter);

    filtered.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="card-actions">
                    <button class="action-btn" onclick="window.addToCart(${product.id})">
                         <span class="material-symbols-rounded">add_shopping_cart</span>
                    </button>
                </div>
            </div>
            <div class="card-info">
                <div class="card-cat">${product.category}</div>
                <h3 class="card-title">${product.name}</h3>
                <div class="card-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        productGrid.appendChild(card);
    });
};

// ==========================================
// 4. UI HANDLERS (DRAWER & OVERLAY)
// ==========================================
const toggleDrawer = (overlayId, drawerId, isOpen) => {
    document.getElementById(overlayId)?.classList.toggle('open', isOpen);
    document.getElementById(drawerId)?.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
};

window.openCart = () => toggleDrawer('cart-overlay', 'cart-drawer', true);
window.closeCart = () => toggleDrawer('cart-overlay', 'cart-drawer', false);
window.openMenu = () => toggleDrawer('menu-overlay', 'menu-drawer', true);
window.closeMenu = () => toggleDrawer('menu-overlay', 'menu-drawer', false);

// ==========================================
// 5. OPTIMIZED ACTIVE STATUS (OBSERVER METHOD)
// ==========================================
function initNavigationObserver() {
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-menu-links a');
    const page = window.location.pathname.split("/").pop().replace('.html', '') || 'index';

    const updateActiveLinks = (targetHref) => {
        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('.html', '');
            
            // 1. Skip logic for hash links (e.g., #shop)
            if (href.startsWith('#')) {
                link.classList.remove('active');
                return;
            }

            // 2. Check if link matches current page
            const isActive = (href === targetHref) || 
                             (targetHref === 'index' && (href === 'index' || href === './' || href === ''));
            
            link.classList.toggle('active', isActive);
        });
    };

    // Observer: Watches the top of the page to reset the "Active" state to the page default
    const topObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) updateActiveLinks(page);
        });
    }, { threshold: 0.1 });

    const topElement = document.querySelector('.hero') || document.querySelector('header');
    if (topElement) topObserver.observe(topElement);
}

// ==========================================
// 6. GLOBAL INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
    initNavigationObserver();

    // Reveal page after a tiny delay for smooth entry
    setTimeout(() => document.body.classList.add('js-page-loaded'), 100);

    // Header scroll background effect
    window.addEventListener('scroll', () => {
        document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Global click listener for Cart/Menu triggers and Smooth Scrolling
    document.addEventListener('click', (e) => {
        const target = e.target;

        if (target.closest('#cart-trigger')) { e.preventDefault(); window.openCart(); }
        if (target.closest('#menu-trigger')) { e.preventDefault(); window.openMenu(); }
        
        const internalLink = target.closest('a[href^="#"]');
        if (internalLink) {
            const href = internalLink.getAttribute('href');
            const section = document.querySelector(href);
            if (section) {
                e.preventDefault();
                window.closeMenu();
                section.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, href);
            }
        }
    });

    // Setup Close Buttons
    const closeTargets = [
        { btn: 'close-cart', overlay: 'cart-overlay', fn: window.closeCart },
        { btn: 'close-menu', overlay: 'menu-overlay', fn: window.closeMenu }
    ];

    closeTargets.forEach(target => {
        document.getElementById(target.btn)?.addEventListener('click', target.fn);
        document.getElementById(target.overlay)?.addEventListener('click', target.fn);
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', initNavigationObserver);
});