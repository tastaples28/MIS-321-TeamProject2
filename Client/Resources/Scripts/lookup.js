// Lookup Page JavaScript Functions
// All JavaScript functions for product lookup functionality

// Favorites System - Database only (all data persisted to MySQL on Heroku)
let currentCategory = 'all';
let currentSearch = '';
let currentDetailProduct = null;
let productsDatabase = []; // Will be populated from API
let favoritesArray = []; // User's favorites loaded from database
let favoriteToggleInProgress = false; // Prevent rapid clicking

// Load favorites from API (database)
async function loadFavoritesFromAPI() {
    const user = getCurrentUser();
    if (!user) {
        favoritesArray = [];
        return;
    }
    
    try {
        const response = await fetch(`${window.API_BASE}/userfavorites/${user.id}`);
        if (response.ok) {
            const favoriteProducts = await response.json();
            favoritesArray = favoriteProducts.map(p => p.id || p.Id);
            console.log('Loaded favorites from database:', favoritesArray);
        }
    } catch (error) {
        console.error('Error loading favorites from API:', error);
        favoritesArray = [];
    }
}

// Get favorites (used by UI)
function getFavorites() {
    return favoritesArray;
}

// Load products from API
async function loadProductsFromAPI() {
    try {
        const response = await fetch(`${window.API_BASE}/products?pageSize=100`);
        if (response.ok) {
            const data = await response.json();
            const apiProducts = data.Products || data.products || [];
            
            // Map API format to our expected format
            productsDatabase = apiProducts.map(p => ({
                id: p.Id || p.id,
                name: p.Name || p.name,
                category: p.Category || p.category,
                brand: p.Brand || p.brand,
                description: p.Description || p.description,
                imageUrl: p.ImageUrl || p.imageUrl,
                oceanScore: p.OceanScore || p.oceanScore,
                score: p.OceanScore || p.oceanScore, // Alias for compatibility
                reason: p.Description || p.description || 'No description available',
                ingredients: p.Ingredients || p.ingredients || []
            }));
        } else {
            console.error('Failed to load products from API');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function checkAuth() {
    // Use the user-auth.js functions
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user greeting using the current user from user-auth.js
    const user = getCurrentUser();
    if (user && document.getElementById('userGreeting')) {
        document.getElementById('userGreeting').textContent = `Welcome back, ${user.username}!`;
    }
}

async function loadFavorites() {
    // Load from API and cache in localStorage
    await loadFavoritesFromAPI();
    updateFavoriteCount();
}

async function updateFavoriteCount() {
    const favCountElement = document.getElementById('favCount');
    if (!favCountElement) return;
    
    const favorites = getFavorites();
    favCountElement.textContent = favorites.length;
}

// Toggle favorite - Database only (all data persisted to MySQL on Heroku)
async function toggleFavorite(productId, event) {
    // Prevent rapid clicking
    if (favoriteToggleInProgress) return;
    favoriteToggleInProgress = true;
    
    const user = getCurrentUser();
    if (!user) {
        alert('Please log in to add favorites');
        favoriteToggleInProgress = false;
        return;
    }
    
    const favorites = getFavorites();
    const isFavorited = favorites.includes(productId);
    
    // Update local array FIRST - this ensures UI reads correct state
    if (isFavorited) {
        favoritesArray = favoritesArray.filter(id => id !== productId);
    } else {
        favoritesArray = [...favorites, productId];
    }
    
    // Update count instantly
    updateFavoriteCount();
    
    // Save to database via API
    try {
        const endpoint = `${window.API_BASE}/userfavorites/${user.id}/favorites/${productId}`;
        if (isFavorited) {
            const response = await fetch(endpoint, { method: 'DELETE' });
            if (!response.ok) {
                // Rollback local change if API fails
                favoritesArray = favorites;
                updateFavoriteCount();
                // Rollback visual state for all instances
                allCardIcons.forEach(icon => icon.classList.add('favorited'));
                if (currentDetailProduct && currentDetailProduct.id === productId) {
                    const detailIcon = document.getElementById('detailFavoriteBtn');
                    if (detailIcon) detailIcon.classList.add('favorited');
                }
                throw new Error('Failed to remove from database');
            }
        } else {
            const response = await fetch(endpoint, { method: 'POST' });
            if (!response.ok) {
                // Rollback local change if API fails
                favoritesArray = favorites;
                updateFavoriteCount();
                // Rollback visual state for all instances
                allCardIcons.forEach(icon => icon.classList.remove('favorited'));
                if (currentDetailProduct && currentDetailProduct.id === productId) {
                    const detailIcon = document.getElementById('detailFavoriteBtn');
                    if (detailIcon) detailIcon.classList.remove('favorited');
                }
                throw new Error('Failed to save to database');
            }
        }
        
        // Re-render main grid to ensure all hearts are in correct state
        displayProducts();
        
        // Update favorites modal if open
        const favoritesModal = document.getElementById('favoritesModal');
        if (favoritesModal && favoritesModal.classList.contains('show')) {
            displayFavoritesModal();
        }
        
        // Update detail modal icon if it's for the current product
        if (currentDetailProduct && currentDetailProduct.id === productId) {
            const detailIcon = document.getElementById('detailFavoriteBtn');
            if (detailIcon) {
                const newIsFavorited = favoritesArray.includes(productId);
                if (newIsFavorited) {
                    detailIcon.classList.add('favorited');
                } else {
                    detailIcon.classList.remove('favorited');
                }
            }
        }
    } catch (error) {
        console.error('Failed to update favorites in database:', error);
        alert('Failed to update favorites. Please try again.');
    } finally {
        favoriteToggleInProgress = false;
    }
}

function selectCategory(category) {
    currentCategory = category;
    
    // Update active chip
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.closest('.category-chip').classList.add('active');
    
    filterProducts();
}

function filterProducts() {
    currentSearch = document.getElementById('searchInput').value.toLowerCase();
    displayProducts();
}

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    
    let filtered = productsDatabase.filter(product => {
        // Case-insensitive category matching
        const matchesCategory = currentCategory === 'all' || 
                               product.category.toLowerCase().trim() === currentCategory.toLowerCase().trim();
        const matchesSearch = product.name.toLowerCase().includes(currentSearch) || 
                             product.category.toLowerCase().includes(currentSearch);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1;">
                <i class="fas fa-search fa-3x mb-3" style="color: #cbd5e1;"></i>
                <h5>No products found</h5>
                <p class="text-muted">Try adjusting your search or category filter</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const favorites = getFavorites();
    const isFavorited = favorites.includes(product.id);
    const scoreClass = product.oceanScore >= 80 ? 'score-safe' : product.oceanScore >= 50 ? 'score-moderate' : 'score-harmful';
    const scoreIcon = product.oceanScore >= 80 ? 'fa-check-circle' : product.oceanScore >= 50 ? 'fa-exclamation-circle' : 'fa-times-circle';
    
    // Escape product name for use in onclick handler
    const escapedName = product.name.replace(/'/g, "\\'");
    
    return `
        <div class="product-card" data-product-id="${product.id}" onclick="openProductDetail(${product.id})">
            <div class="product-image-container">
                <img src="${product.imageUrl || 'assets/logo/main-logo.png'}" alt="${product.name}" class="product-image" 
                     crossorigin="anonymous"
                     onerror="this.onerror=null; this.src='assets/logo/main-logo.png';">
                <div class="favorite-icon ${isFavorited ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
                    <i class="fas fa-heart"></i>
                </div>
            </div>
            <div class="product-body">
                <span class="product-category">
                    <i class="fas fa-tag me-1"></i>${product.category}
                </span>
                <div class="product-name">${product.name}</div>
                ${product.brand ? `<div style="color: #64748b; font-size: 0.9rem; margin-bottom: 10px;">${product.brand}</div>` : ''}
                
                <div class="score-badge ${scoreClass}">
                    <i class="fas ${scoreIcon}"></i>
                    Ocean Score: ${product.oceanScore}/100
                </div>
                
                ${product.description ? `
                <div class="score-reason">
                    <i class="fas fa-info-circle me-1"></i>${product.description}
                </div>
                ` : ''}
                
                ${createIngredientsSection(product)}
                
                <button class="buy-button" onclick="event.stopPropagation(); buyProduct('${escapedName}')">
                    <i class="fas fa-shopping-cart me-2"></i>Buy Now
                </button>
            </div>
        </div>
    `;
}

function createIngredientsSection(product) {
    if (!product.ingredients || product.ingredients.length === 0) {
        return '';
    }
    
    const harmfulIngredients = product.ingredients.filter(ing => ing.isReefSafe === false);
    const safeIngredients = product.ingredients.filter(ing => ing.isReefSafe === true);
    
    if (harmfulIngredients.length > 0) {
        return `
            <div class="ingredients-section">
                <div style="font-weight: 700; color: #dc2626; margin-bottom: 8px;">
                    <i class="fas fa-exclamation-triangle me-1"></i>Harmful Ingredients Detected:
                </div>
                ${harmfulIngredients.slice(0, 3).map(ing => 
                    `<span class="ingredient-tag ingredient-harmful">${ing.name}</span>`
                ).join('')}
            </div>
        `;
    } else if (safeIngredients.length > 0) {
        return `
            <div class="ingredients-section safe">
                <div style="font-weight: 700; color: #059669; margin-bottom: 8px;">
                    <i class="fas fa-leaf me-1"></i>Safe Ingredients:
                </div>
                ${safeIngredients.slice(0, 4).map(ing => 
                    `<span class="ingredient-tag ingredient-safe">${ing.name}</span>`
                ).join('')}
            </div>
        `;
    }
    
    return '';
}

function buyProduct(productName) {
    // Simulate external purchase link
    alert(`🌊 Redirecting to purchase ${productName}...\n\n(This is a demo link. In a real app, this would open the product page on a retail website.)`);
}

function showFavorites() {
    const modal = document.getElementById('favoritesModal');
    modal.classList.add('show');
    displayFavoritesModal();
}

function closeFavorites() {
    document.getElementById('favoritesModal').classList.remove('show');
}

async function displayFavoritesModal() {
    const grid = document.getElementById('favoritesGrid');
    const noFavs = document.getElementById('noFavorites');
    
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        grid.style.display = 'none';
        noFavs.style.display = 'block';
        return;
    }
    
    // Get products from database that are favorited
    const favoriteProducts = productsDatabase.filter(p => favorites.includes(p.id));
    
    if (favoriteProducts.length === 0) {
        grid.style.display = 'none';
        noFavs.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noFavs.style.display = 'none';
    grid.innerHTML = favoriteProducts.map(product => createProductCard(product)).join('');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        handleLogout();
        window.location.href = 'login.html';
    }
}

// Product Detail Functions
function openProductDetail(productId) {
    const product = productsDatabase.find(p => p.id === productId);
    if (!product) return;
    
    currentDetailProduct = product;
    const modal = document.getElementById('productDetailModal');
    
    // Populate detail view - use correct property names from API
    const detailImage = document.getElementById('detailImage');
    detailImage.src = product.imageUrl || 'assets/logo/main-logo.png';
    detailImage.alt = product.name;
    detailImage.crossOrigin = 'anonymous';
    detailImage.onerror = function() {
        this.onerror = null; // Prevent infinite loop
        this.src = 'assets/logo/main-logo.png';
    };
    document.getElementById('detailCategory').innerHTML = `<i class="fas fa-tag me-2"></i>${product.category}`;
    document.getElementById('detailTitle').textContent = product.name;
    
    // Score section - use oceanScore
    const score = product.oceanScore || product.score || 0;
    const scoreClass = score >= 80 ? 'score-safe-bg' : score >= 50 ? 'score-moderate-bg' : 'score-harmful-bg';
    const scoreIcon = score >= 80 ? 'fa-check-circle' : score >= 50 ? 'fa-exclamation-circle' : 'fa-times-circle';
    const scoreLabel = score >= 80 ? 'Highly Reef-Safe' : score >= 50 ? 'Moderately Safe' : 'Potentially Harmful';
    const scoreLabelColor = score >= 80 ? 'var(--sea-green)' : score >= 50 ? '#F59E0B' : 'var(--coral-pink)';
    
    const scoreCircle = document.getElementById('detailScoreCircle');
    scoreCircle.textContent = score;
    scoreCircle.className = 'detail-score-circle ' + scoreClass;
    
    document.getElementById('detailScoreLabel').innerHTML = `
        <i class="fas ${scoreIcon}" style="color: ${scoreLabelColor};"></i>
        <span style="color: ${scoreLabelColor};">${scoreLabel}</span>
    `;
    document.getElementById('detailScoreReason').textContent = product.description || product.reason || 'No description available.';
    
    // Ingredients section
    const ingredientsSection = document.getElementById('detailIngredientsSection');
    const harmfulIngredients = product.ingredients ? product.ingredients.filter(ing => !ing.isReefSafe) : [];
    const safeIngredients = product.ingredients ? product.ingredients.filter(ing => ing.isReefSafe) : [];
    
    if (harmfulIngredients.length > 0) {
        ingredientsSection.innerHTML = `
            <div class="detail-ingredients-title" style="color: #dc2626;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Harmful Ingredients Detected</span>
            </div>
            <div>
                ${harmfulIngredients.map(ing => 
                    `<span class="detail-ingredient-tag ingredient-harmful">${ing.name || ing}</span>`
                ).join('')}
            </div>
            <p style="margin-top: 15px; color: #64748b; line-height: 1.6;">
                These ingredients have been identified as harmful to coral reefs and marine ecosystems. 
                Consider choosing products without these chemicals to help protect our oceans.
            </p>
        `;
        ingredientsSection.style.background = 'rgba(248, 113, 113, 0.05)';
        ingredientsSection.style.borderLeft = '4px solid var(--coral-pink)';
    } else if (safeIngredients.length > 0) {
        ingredientsSection.innerHTML = `
            <div class="detail-ingredients-title" style="color: #059669;">
                <i class="fas fa-leaf"></i>
                <span>Safe Ingredients</span>
            </div>
            <div>
                ${safeIngredients.map(ing => 
                    `<span class="detail-ingredient-tag ingredient-safe">${ing.name || ing}</span>`
                ).join('')}
            </div>
            <p style="margin-top: 15px; color: #64748b; line-height: 1.6;">
                This product contains reef-friendly ingredients that are biodegradable and safe for marine life. 
                Great choice for protecting our ocean ecosystems!
            </p>
        `;
        ingredientsSection.style.background = 'rgba(16, 185, 129, 0.05)';
        ingredientsSection.style.borderLeft = '4px solid var(--sea-green)';
    } else {
        ingredientsSection.innerHTML = `
            <p style="color: #64748b; line-height: 1.6; text-align: center;">
                No ingredient information available for this product.
            </p>
        `;
        ingredientsSection.style.background = 'transparent';
        ingredientsSection.style.borderLeft = 'none';
    }
    
    // Favorite button - check favoritesArray for current state
    const isFavorited = favoritesArray.includes(product.id);
    const favBtn = document.getElementById('detailFavoriteBtn');
    favBtn.className = 'detail-favorite-btn' + (isFavorited ? ' favorited' : '');
    
    // Buy button
    document.getElementById('detailBuyBtn').onclick = function() {
        buyProduct(product.name);
    };
    
    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        currentDetailProduct = null;
    }, 400);
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

async function toggleDetailFavorite() {
    if (!currentDetailProduct) return;
    
    const productId = currentDetailProduct.id;
    
    // Call the main toggleFavorite function which handles all updates
    await toggleFavorite(productId);
}

// Initialize the lookup page
window.onload = async function() {
    // Wait for user-auth.js to load and initialize, then restore session
    setTimeout(async () => {
        // Check if user is stored in sessionStorage and restore it
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            // Restore user to user-auth.js global variable
            if (typeof currentUser === 'undefined') {
                window.currentUser = JSON.parse(savedUser);
            }
        }
        
        // Now check authentication
        checkAuth();
        await loadProductsFromAPI();
        loadFavorites();
        displayProducts();
        updateFavoriteCount();
        
        // Close modals on outside click
        document.getElementById('favoritesModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeFavorites();
            }
        });
        
        document.getElementById('productDetailModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeProductDetail();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (document.getElementById('productDetailModal').classList.contains('show')) {
                    closeProductDetail();
                } else if (document.getElementById('favoritesModal').classList.contains('show')) {
                    closeFavorites();
                }
            }
        });
    }, 500);
};

