// ==========================================
// 1. GLOBAL DATA & STATE
// ==========================================
window.products = []; 
window.cart = JSON.parse(localStorage.getItem('andStepCart')) || [];

async function loadProducts() {
    try {
        const response = await fetch('assets/products.json');
        window.products = await response.json();
        
        if (document.getElementById('product-grid')) {
            window.renderProducts();
        }
    } catch (error) {
        console.error("Error loading products:", error);
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

    checkoutButtons.forEach(btn => {
        const isEmpty = window.cart.length === 0;
        btn.disabled = isEmpty;
        btn.style.filter = isEmpty ? "grayscale(1)" : "none";
        btn.style.opacity = isEmpty ? "0.5" : "1";
    });

    if (window.cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your bag is empty.</div>';
        if (cartTotalEl) cartTotalEl.textContent = '$0.00';
    } else {
        cartItemsContainer.innerHTML = window.cart.map(item => `
            <div class="cart-item" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center;">
                <img src="${item.image}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;" alt="${item.name}">
                <div class="cart-item-info" style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin: 0;">${item.name}</h4>
                    <p style="font-size: 0.8rem; color: #666; margin: 2px 0;">${item.color}</p>
                    <div class="qty-controls" style="display: flex; align-items: center; gap: 0.8rem; margin: 5px 0;">
                        <button onclick="window.updateQuantity(${item.id}, -1)" class="qty-btn">-</button>
                        <span style="font-size: 0.9rem; font-weight: 600;">${item.qty}</span>
                        <button onclick="window.updateQuantity(${item.id}, 1)" class="qty-btn">+</button>
                    </div>
                    <p style="font-weight: 700; font-size: 0.9rem;">$${(item.price * item.qty).toFixed(2)}</p>
                    <button class="remove-btn" onclick="window.removeFromCart(${item.id})" style="font-size: 0.7rem; color: #ff4d00; text-transform: uppercase; font-weight: 800; padding: 0; background:none; border:none; cursor:pointer;">Remove</button>
                </div>
            </div>
        `).join('');
        const total = window.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        if (cartTotalEl) cartTotalEl.textContent = '$' + total.toFixed(2);
    }
}

// ==========================================
// 3. PRODUCT RENDERING (Performance Optimized)
// ==========================================
window.renderProducts = function(filter = 'all') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    // --- CRITICAL FIX: Kill ALL triggers related to the grid ---
    let triggers = ScrollTrigger.getAll();
    triggers.forEach(trigger => {
        if (trigger.vars.trigger === "#product-grid" || trigger.vars.trigger === productGrid) {
            trigger.kill();
        }
    });

    productGrid.innerHTML = ''; 
    const filtered = filter === 'all' ? window.products : window.products.filter(p => p.category === filter);

    filtered.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // Set state to zero instantly before append
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        card.innerHTML = `
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="card-actions">
                    <button class="action-btn" onclick="window.addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                    <button class="action-btn">
                        <i class="fa-solid fa-eye"></i>
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

    // --- REFRESH GSAP AFTER DOM PAINT ---
    setTimeout(() => {
        ScrollTrigger.refresh();
        initScrollAnimations();
    }, 50);
};

// ==========================================
// 4. ANIMATIONS (GSAP)
// ==========================================
function initScrollAnimations() {
    const cards = document.querySelectorAll('.product-card');
    if (cards.length > 0) {
        gsap.to(cards, {
            scrollTrigger: { 
                trigger: "#product-grid", 
                start: "top 90%",
                toggleActions: "play none none none" 
            },
            y: 0, 
            opacity: 1, 
            duration: 0.5, 
            stagger: 0.08, 
            ease: "power2.out",
            overwrite: true 
        });
    }
}

// ==========================================
// 5. DRAWER & NAVIGATION
// ==========================================
window.openCart = () => {
    document.getElementById('cart-overlay')?.classList.add('open');
    gsap.to("#cart-drawer", { x: "0%", duration: 0.6, ease: "expo.out", overwrite: true });
};

window.closeCart = () => {
    document.getElementById('cart-overlay')?.classList.remove('open');
    gsap.to("#cart-drawer", { x: "100%", duration: 0.4, ease: "power2.in", overwrite: true });
};

// ==========================================
// 6. INITIALIZATION
// ==========================================
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
    
    // --- HERO FIX: Split Hero into separate timeline to prevent interference ---
    const heroTl = gsap.timeline();
    
    if (document.getElementById('loader')) {
        heroTl.to("#loader", { yPercent: -100, duration: 1, ease: "power4.inOut" });
    }

    if (document.querySelector('.hero-title')) {
        heroTl.from(".hero-title", { y: 60, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.4")
              .from(".hero-shoe", { x: 80, opacity: 0, duration: 1, ease: "back.out(1.5)" }, "-=0.7");
        
        // Use a separate tween for floating to prevent heroTl from "locking" the shoe
        gsap.to(".hero-shoe", { 
            y: -20, 
            duration: 2.5, 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut",
            force3D: true 
        });
    }

    // Scroll Header
    window.addEventListener('scroll', () => {
        document.getElementById('header')?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Events
    document.getElementById('cart-trigger')?.addEventListener('click', (e) => { e.preventDefault(); window.openCart(); });
    document.getElementById('close-cart')?.addEventListener('click', window.closeCart);
    document.getElementById('cart-overlay')?.addEventListener('click', window.closeCart);

    // Filter Listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.renderProducts(btn.getAttribute('data-filter'));
        });
    });
});

// Protect Assets
document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG' || e.target.closest('i')) e.preventDefault();
}, false);