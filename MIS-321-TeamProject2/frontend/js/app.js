// Global variables
let currentUser = null;
let currentProductId = null;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let currentPage = 1;
let totalPages = 1;

// Initialize dummy data in local storage
function initializeDummyData() {
    const dummyProducts = [
        {
            id: 1,
            name: "Reef-Safe Sunscreen SPF 30",
            brand: "OceanGuard",
            category: "Sunscreen",
            description: "Mineral-based sunscreen that protects your skin while keeping coral reefs safe.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/oceanguard-sunscreen",
            oceanScore: 85,
            biodegradabilityScore: 90,
            coralSafetyScore: 95,
            fishSafetyScore: 88,
            coverageScore: 80,
            ingredients: ["Zinc Oxide (22%)", "Titanium Dioxide (8%)", "Coconut Oil", "Shea Butter", "Vitamin E", "Aloe Vera Extract", "Green Tea Extract", "Jojoba Oil", "Beeswax", "Natural Vanilla Extract"]
        },
        {
            id: 2,
            name: "Eco-Friendly Shampoo",
            brand: "SeaPure",
            category: "Hair Care",
            description: "Biodegradable shampoo made with ocean-friendly ingredients.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/seapure-shampoo",
            oceanScore: 78,
            biodegradabilityScore: 85,
            coralSafetyScore: 80,
            fishSafetyScore: 75,
            coverageScore: 70,
            ingredients: ["Seaweed Extract", "Coconut Surfactants", "Aloe Vera", "Vitamin E", "Argan Oil", "Keratin", "Biotin", "Chamomile Extract", "Lavender Oil", "Sea Salt"]
        },
        {
            id: 3,
            name: "Marine-Safe Body Wash",
            brand: "BlueWave",
            category: "Body Care",
            description: "Gentle body wash that won't harm marine life when it reaches the ocean.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/bluewave-bodywash",
            oceanScore: 82,
            biodegradabilityScore: 88,
            coralSafetyScore: 85,
            fishSafetyScore: 80,
            coverageScore: 75,
            ingredients: ["Plant-Based Surfactants", "Sea Salt", "Marine Collagen", "Essential Oils", "Coconut Oil", "Shea Butter", "Vitamin C", "Eucalyptus Extract", "Tea Tree Oil", "Glycerin"]
        },
        {
            id: 4,
            name: "Coral Reef Facial Cleanser",
            brand: "ReefCare",
            category: "Skincare",
            description: "Daily facial cleanser formulated to be completely reef-safe.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/reefcare-cleanser",
            oceanScore: 90,
            biodegradabilityScore: 92,
            coralSafetyScore: 95,
            fishSafetyScore: 88,
            coverageScore: 85,
            ingredients: ["Marine Algae", "Hyaluronic Acid", "Green Tea Extract", "Probiotics", "Vitamin B5", "Niacinamide", "Sea Buckthorn Oil", "Rosehip Oil", "Chamomile Water", "Natural Glycerin"]
        },
        {
            id: 5,
            name: "Ocean-Friendly Moisturizer",
            brand: "AquaGlow",
            category: "Skincare",
            description: "Hydrating moisturizer with ingredients that are safe for ocean ecosystems.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/aquaglow-moisturizer",
            oceanScore: 88,
            biodegradabilityScore: 90,
            coralSafetyScore: 92,
            fishSafetyScore: 85,
            coverageScore: 87,
            ingredients: ["Sea Buckthorn Oil", "Marine Collagen", "Aloe Vera", "Vitamin C", "Hyaluronic Acid", "Shea Butter", "Jojoba Oil", "Vitamin E", "Green Tea Extract", "Cucumber Extract"]
        },
        {
            id: 6,
            name: "Eco-Safe Hair Conditioner",
            brand: "SeaPure",
            category: "Hair Care",
            description: "Deep conditioning treatment that nourishes hair without harming marine life.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/seapure-conditioner",
            oceanScore: 75,
            biodegradabilityScore: 82,
            coralSafetyScore: 78,
            fishSafetyScore: 80,
            coverageScore: 65,
            ingredients: ["Seaweed Extract", "Argan Oil", "Keratin", "Biotin", "Coconut Oil", "Avocado Oil", "Honey", "Chamomile Extract", "Lavender Oil", "Vitamin B5"]
        },
        {
            id: 7,
            name: "Marine-Safe Deodorant",
            brand: "BlueWave",
            category: "Personal Care",
            description: "Natural deodorant that's safe for both you and the ocean.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/bluewave-deodorant",
            oceanScore: 80,
            biodegradabilityScore: 85,
            coralSafetyScore: 82,
            fishSafetyScore: 78,
            coverageScore: 75,
            ingredients: ["Baking Soda", "Coconut Oil", "Arrowroot Powder", "Essential Oils", "Shea Butter", "Kaolin Clay", "Vitamin E", "Tea Tree Oil", "Lavender Oil", "Natural Beeswax"]
        },
        {
            id: 8,
            name: "Reef-Friendly Lip Balm",
            brand: "OceanGuard",
            category: "Skincare",
            description: "Moisturizing lip balm with SPF protection that won't harm coral reefs.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/oceanguard-lipbalm",
            oceanScore: 92,
            biodegradabilityScore: 95,
            coralSafetyScore: 98,
            fishSafetyScore: 90,
            coverageScore: 85,
            ingredients: ["Beeswax", "Coconut Oil", "Zinc Oxide (5%)", "Vitamin E", "Shea Butter", "Jojoba Oil", "Cocoa Butter", "Natural Vanilla", "Peppermint Oil", "Sunflower Oil"]
        },
        {
            id: 9,
            name: "Eco-Friendly Hand Soap",
            brand: "SeaPure",
            category: "Personal Care",
            description: "Gentle hand soap that cleans effectively while protecting ocean life.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/seapure-handsoap",
            oceanScore: 85,
            biodegradabilityScore: 90,
            coralSafetyScore: 88,
            fishSafetyScore: 82,
            coverageScore: 80,
            ingredients: ["Plant-Based Surfactants", "Sea Salt", "Aloe Vera", "Tea Tree Oil", "Coconut Oil", "Glycerin", "Vitamin E", "Lavender Extract", "Chamomile Water", "Natural Preservatives"]
        },
        {
            id: 10,
            name: "Marine-Safe Body Lotion",
            brand: "AquaGlow",
            category: "Body Care",
            description: "Rich body lotion with marine ingredients that are ocean-friendly.",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/aquaglow-lotion",
            oceanScore: 87,
            biodegradabilityScore: 88,
            coralSafetyScore: 90,
            fishSafetyScore: 85,
            coverageScore: 88,
            ingredients: ["Sea Buckthorn Oil", "Marine Collagen", "Shea Butter", "Vitamin E", "Coconut Oil", "Aloe Vera", "Hyaluronic Acid", "Jojoba Oil", "Green Tea Extract", "Natural Glycerin"]
        },
        {
            id: 11,
            name: "Traditional Sunscreen SPF 50",
            brand: "SunMax",
            category: "Sunscreen",
            description: "High SPF sunscreen with chemical UV filters (not reef-safe).",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/sunmax-sunscreen",
            oceanScore: 25,
            biodegradabilityScore: 30,
            coralSafetyScore: 20,
            fishSafetyScore: 35,
            coverageScore: 90,
            ingredients: ["Oxybenzone (6%)", "Octinoxate (7.5%)", "Avobenzone (3%)", "Homosalate (15%)", "Octocrylene (10%)", "Dimethicone", "Cyclopentasiloxane", "Phenoxyethanol", "Artificial Fragrances", "Parabens"]
        },
        {
            id: 12,
            name: "Regular Shampoo",
            brand: "CleanHair",
            category: "Hair Care",
            description: "Standard shampoo with synthetic ingredients (not ocean-friendly).",
            imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            externalLink: "https://example.com/cleanhair-shampoo",
            oceanScore: 35,
            biodegradabilityScore: 40,
            coralSafetyScore: 30,
            fishSafetyScore: 45,
            coverageScore: 85,
            ingredients: ["Sodium Lauryl Sulfate", "Parabens", "Silicones", "Artificial Fragrances", "Dimethicone", "Cyclopentasiloxane", "Phenoxyethanol", "Methylchloroisothiazolinone", "Propylene Glycol", "Synthetic Dyes"]
        }
    ];

    // Store dummy data in local storage
    localStorage.setItem('products', JSON.stringify(dummyProducts));
    
    // Initialize empty favorites if not exists
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify([]));
    }
    
    return dummyProducts;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dummy data
    initializeDummyData();
    loadFavorites();
    
    // Ensure we start on home page
    console.log('Initializing application - showing home page');
    showPage('home');
    
    // Make sure home navigation link is active
    setTimeout(() => {
        const homeLink = document.querySelector('[onclick="showPage(\'home\')"]');
        if (homeLink && !homeLink.classList.contains('active')) {
            homeLink.classList.add('active');
        }
    }, 100);
});

// Navigation functions
function showPage(pageName) {
    console.log('Showing page:', pageName);
    
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Page shown:', pageName);
    } else {
        console.error('Page not found:', pageName + '-page');
    }
    
    // Add active class to the corresponding nav link
    const navLink = document.querySelector(`[onclick="showPage('${pageName}')"]`);
    if (navLink) {
        navLink.classList.add('active');
        console.log('Nav link activated:', pageName);
    } else {
        console.error('Nav link not found for:', pageName);
    }
    
    // Load page-specific data
    switch(pageName) {
        case 'products':
            searchProducts();
            break;
        case 'favorites':
            loadFavorites();
            break;
        case 'admin':
            // Admin page will handle its own loading
            break;
        case 'about':
            // About page is static
            break;
        case 'home':
            // Home page is static
            break;
    }
}

// Search functions
function searchFromHome() {
    const searchTerm = document.getElementById('home-search').value;
    if (searchTerm.trim()) {
        document.getElementById('search-term').value = searchTerm;
        showPage('products');
        searchProducts();
    }
}

async function searchProducts() {
    const searchTerm = document.getElementById('search-term').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const minScore = parseInt(document.getElementById('min-score').value) || 0;
    const maxScore = parseInt(document.getElementById('max-score').value) || 100;
    
    showLoading(true);
    
    try {
        // Get products from local storage
        const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Filter products based on search criteria
        let filteredProducts = allProducts.filter(product => {
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !category || product.category === category;
            const matchesMinScore = product.oceanScore >= minScore;
            const matchesMaxScore = product.oceanScore <= maxScore;
            
            return matchesSearch && matchesCategory && matchesMinScore && matchesMaxScore;
        });
        
        // Pagination
        const pageSize = 12;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        displayProducts(paginatedProducts);
        updatePagination(filteredProducts.length, pageSize);
        
        // Log search analytics (simulate)
        console.log('Search performed:', { searchTerm, category, minScore, maxScore, results: filteredProducts.length });
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search products. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="card">
                    <div class="card-body">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5>No products found</h5>
                        <p class="text-muted">Try adjusting your search criteria</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card product-card">
                <div class="card-header bg-transparent border-0 p-2">
                    <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-small">
                    <small class="text-muted">Ocean-Friendly Certified</small>
                </div>
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" class="card-img-top product-image" alt="${product.name}">` : 
                    `<div class="product-image bg-light d-flex align-items-center justify-content-center">
                        <i class="fas fa-box fa-3x text-muted"></i>
                    </div>`
                }
                <div class="card-body">
                    <h6 class="card-title">${product.name}</h6>
                    <p class="card-text text-muted small">${product.brand}</p>
                    <div class="mb-2">
                        ${getOceanScoreBadge(product.oceanScore)}
                    </div>
                    <p class="card-text small text-muted">${product.category}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex gap-2">
                        <button class="btn btn-ocean btn-sm flex-grow-1" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="toggleFavoriteFromCard(${product.id})" title="${favorites.includes(product.id) ? 'Remove from Favorites' : 'Add to Favorites'}">
                            <i class="fas fa-heart ${favorites.includes(product.id) ? 'text-danger' : ''}"></i>
                    </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getOceanScoreBadge(score) {
    let badgeClass = 'score-harmful';
    let level = 'Harmful';
    
    if (score >= 80) {
        badgeClass = 'score-safe';
        level = 'Safe';
    } else if (score >= 50) {
        badgeClass = 'score-moderate';
        level = 'Moderate';
    }
    
    return `<span class="ocean-score-badge ${badgeClass}">Ocean Score: ${score} (${level})</span>`;
}

function updatePagination(totalCount, pageSize) {
    totalPages = Math.ceil(totalCount / pageSize);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        searchProducts();
    }
}

// Product details modal
async function viewProduct(productId) {
    currentProductId = productId;
    
    try {
        // Get products from local storage
        const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const product = allProducts.find(p => p.id === parseInt(productId));
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Log view analytics (simulate)
        console.log('Product viewed:', productId);
        
        displayProductModal(product);
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product details.');
    }
}

function displayProductModal(product) {
    const modalTitle = document.getElementById('productModalTitle');
    const modalBody = document.getElementById('productModalBody');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    modalTitle.innerHTML = `
        <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-favicon">
        ${product.name}
    `;
    
    const isFavorite = favorites.includes(product.id);
    favoriteBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart text-danger"></i> Remove from Favorites' : 
        '<i class="fas fa-heart"></i> Add to Favorites';
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" class="img-fluid rounded" alt="${product.name}">` : 
                    `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 200px;">
                        <i class="fas fa-box fa-3x text-muted"></i>
                    </div>`
                }
            </div>
            <div class="col-md-8">
                <h5>${product.brand}</h5>
                <p class="text-muted">${product.category}</p>
                <div class="mb-3">
                    ${getOceanScoreBadge(product.oceanScore)}
                </div>
                ${product.description ? `<p>${product.description}</p>` : ''}
                
                <h6>Ocean Score Breakdown:</h6>
                <div class="row mb-3">
                    <div class="col-6">
                        <small class="text-muted">Biodegradability</small>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-success" style="width: ${product.biodegradabilityScore}%"></div>
                        </div>
                        <small>${product.biodegradabilityScore}/100</small>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Coral Safety</small>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-info" style="width: ${product.coralSafetyScore}%"></div>
                        </div>
                        <small>${product.coralSafetyScore}/100</small>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <small class="text-muted">Fish Safety</small>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-primary" style="width: ${product.fishSafetyScore}%"></div>
                        </div>
                        <small>${product.fishSafetyScore}/100</small>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Coverage</small>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-warning" style="width: ${product.coverageScore}%"></div>
                        </div>
                        <small>${product.coverageScore}/100</small>
                    </div>
                </div>
                
                ${product.ingredients && product.ingredients.length > 0 ? `
                    <h6>Ingredients:</h6>
                    <div class="ingredient-list">
                        ${product.ingredients.map(ingredient => `
                            <div class="ingredient-item">
                                <i class="fas fa-leaf text-success"></i>
                                ${ingredient}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${product.externalLink ? `
                    <div class="mt-3">
                        <a href="${product.externalLink}" target="_blank" class="btn btn-outline-primary">
                            <i class="fas fa-external-link-alt"></i> View Product Online
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function toggleFavorite() {
    if (!currentProductId) return;
    
    const index = favorites.indexOf(currentProductId);
    if (index > -1) {
        favorites.splice(index, 1);
        logAnalytics('unfavorite', currentProductId);
    } else {
        favorites.push(currentProductId);
        logAnalytics('favorite', currentProductId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update button
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isFavorite = favorites.includes(currentProductId);
    favoriteBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart text-danger"></i> Remove from Favorites' : 
        '<i class="fas fa-heart"></i> Add to Favorites';
    
    // Update favorites page if it's currently active
    if (document.getElementById('favorites-page').classList.contains('active')) {
        loadFavorites();
    }
}

function toggleFavoriteFromCard(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
        logAnalytics('unfavorite', productId);
    } else {
        favorites.push(productId);
        logAnalytics('favorite', productId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Refresh the current page to update the heart icons
    const currentPage = document.querySelector('.page-section.active');
    if (currentPage) {
        const pageId = currentPage.id;
        if (pageId === 'products-page') {
            searchProducts(); // Refresh products page
        } else if (pageId === 'favorites-page') {
            loadFavorites(); // Refresh favorites page
        }
    }
}

// Favorites functions
async function loadFavorites() {
    const grid = document.getElementById('favorites-grid');
    
    if (favorites.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="card">
                    <div class="card-body">
                        <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                        <h5>No favorites yet</h5>
                        <p class="text-muted">Start exploring products and add them to your favorites!</p>
                        <button class="btn btn-ocean" onclick="showPage('products')">
                            <i class="fas fa-search"></i> Browse Products
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        // Get products from local storage
        const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));
        
        // Display favorites in the favorites grid
        displayFavorites(favoriteProducts);
        
    } catch (error) {
        console.error('Error loading favorites:', error);
        showError('Failed to load favorites.');
    }
}

function displayFavorites(products) {
    const grid = document.getElementById('favorites-grid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="card">
                    <div class="card-body">
                        <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                        <h5>No favorites yet</h5>
                        <p class="text-muted">Start exploring products and add them to your favorites!</p>
                        <button class="btn btn-ocean" onclick="showPage('products')">
                            <i class="fas fa-search"></i> Browse Products
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card product-card">
                <div class="card-header bg-transparent border-0 p-2">
                    <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-small">
                    <small class="text-muted">Ocean-Friendly Certified</small>
                </div>
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" class="card-img-top product-image" alt="${product.name}">` : 
                    `<div class="product-image bg-light d-flex align-items-center justify-content-center">
                        <i class="fas fa-box fa-3x text-muted"></i>
                    </div>`
                }
                <div class="card-body">
                    <h6 class="card-title">${product.name}</h6>
                    <p class="card-text text-muted small">${product.brand}</p>
                    <div class="mb-2">
                        ${getOceanScoreBadge(product.oceanScore)}
                    </div>
                    <p class="card-text small text-muted">${product.category}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex gap-2">
                        <button class="btn btn-ocean btn-sm flex-grow-1" onclick="viewProduct(${product.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="toggleFavoriteFromCard(${product.id})" title="Remove from Favorites">
                            <i class="fas fa-heart text-danger"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Admin functions
async function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', isAdmin: true };
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        showAdminSection('products');
    } else {
        showError('Invalid admin credentials.');
    }
}

function showAdminSection(section) {
    // Update active tab
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section content
    const content = document.getElementById('admin-content');
    
    switch(section) {
        case 'products':
            loadAdminProducts();
            break;
        case 'ingredients':
            loadAdminIngredients();
            break;
        case 'users':
            loadAdminUsers();
            break;
        case 'analytics':
            loadAdminAnalytics();
            break;
        case 'weights':
            loadAdminWeights();
            break;
    }
}

async function loadAdminProducts() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    try {
        // Get products from local storage
        const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
        
        content.innerHTML = `
            <div class="d-flex align-items-center mb-4">
                <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-section-header">
                <h4 class="mb-0">Products Management</h4>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span>Total Products: ${allProducts.length}</span>
                <button class="btn btn-ocean" onclick="showAddProductForm()">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Ocean Score</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allProducts.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.brand}</td>
                                <td>${product.category}</td>
                                <td>${getOceanScoreBadge(product.oceanScore)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<div class="alert alert-danger">Failed to load products.</div>';
    }
}

async function loadAdminAnalytics() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    try {
        // Get analytics from local storage
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Calculate analytics data
        const totalSearches = analytics.filter(a => a.action === 'search').length;
        const totalProductViews = analytics.filter(a => a.action === 'view').length;
        const totalFavorites = JSON.parse(localStorage.getItem('favorites') || '[]').length;
        const avgOceanScore = products.length > 0 ? 
            Math.round(products.reduce((sum, p) => sum + p.oceanScore, 0) / products.length) : 0;
        
        const data = {
            totalSearches,
            totalProductViews,
            totalFavorites,
            averageOceanScore: avgOceanScore,
            topProducts: products.sort((a, b) => b.oceanScore - a.oceanScore).slice(0, 5),
            harmfulIngredients: [] // Simplified for local storage version
        };
        
        content.innerHTML = `
            <div class="d-flex align-items-center mb-4">
                <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-section-header">
                <h4 class="mb-0">Analytics Dashboard</h4>
            </div>
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-primary">${data.totalSearches}</h5>
                            <p class="card-text">Total Searches</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-info">${data.totalProductViews}</h5>
                            <p class="card-text">Product Views</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-success">${data.totalFavorites}</h5>
                            <p class="card-text">Favorites</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-warning">${data.averageOceanScore}</h5>
                            <p class="card-text">Avg Ocean Score</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h5>Top Products</h5>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Views</th>
                                    <th>Favorites</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.topProducts.slice(0, 5).map(product => `
                                    <tr>
                                        <td>${product.productName}</td>
                                        <td>${product.viewCount}</td>
                                        <td>${product.favoriteCount}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>Category Statistics</h5>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Products</th>
                                    <th>Avg Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.categoryStats.map(category => `
                                    <tr>
                                        <td>${category.category}</td>
                                        <td>${category.productCount}</td>
                                        <td>${category.averageOceanScore}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <button class="btn btn-ocean" onclick="exportAnalytics()">
                    <i class="fas fa-download"></i> Export CSV
                </button>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<div class="alert alert-danger">Failed to load analytics.</div>';
    }
}

async function exportAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics/export/csv`);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError('Failed to export analytics.');
    }
}

// Utility functions
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = show ? 'block' : 'none';
}

function showError(message) {
    // Create a simple alert for now
    alert(message);
}

async function logAnalytics(action, productId = null, metadata = null) {
    try {
        // Store analytics in local storage instead of API call
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        analytics.push({
            id: Date.now(),
            action: action,
                productId: productId,
            userId: null, // No user system in local storage version
            timestamp: new Date().toISOString(),
            metadata: metadata
        });
        localStorage.setItem('analytics', JSON.stringify(analytics));
        
        console.log('Analytics logged:', { action, productId, metadata });
    } catch (error) {
        console.error('Failed to log analytics:', error);
    }
}

async function loadAdminWeights() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
    
    try {
        // Get weights from local storage (default values)
        const weights = JSON.parse(localStorage.getItem('oceanScoreWeights') || JSON.stringify({
            biodegradabilityWeight: 25,
            coralSafetyWeight: 30,
            fishSafetyWeight: 25,
            coverageWeight: 20
        }));
        
        content.innerHTML = `
            <div class="d-flex align-items-center mb-4">
                <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-section-header">
                <h4 class="mb-0">Ocean Score Algorithm Weights</h4>
            </div>
            <div class="card">
                <div class="card-body">
                    <p class="text-muted mb-4">Adjust the weights for the Ocean Score calculation algorithm. Total must equal 100%.</p>
                    
                    <form id="weightsForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="biodegradabilityWeight" class="form-label">Biodegradability Weight (%)</label>
                                <input type="number" class="form-control" id="biodegradabilityWeight" 
                                       value="${weights.biodegradabilityWeight}" min="0" max="100" step="1">
                            </div>
                            <div class="col-md-6">
                                <label for="coralSafetyWeight" class="form-label">Coral Safety Weight (%)</label>
                                <input type="number" class="form-control" id="coralSafetyWeight" 
                                       value="${weights.coralSafetyWeight}" min="0" max="100" step="1">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="fishSafetyWeight" class="form-label">Fish Safety Weight (%)</label>
                                <input type="number" class="form-control" id="fishSafetyWeight" 
                                       value="${weights.fishSafetyWeight}" min="0" max="100" step="1">
                            </div>
                            <div class="col-md-6">
                                <label for="coverageWeight" class="form-label">Coverage Weight (%)</label>
                                <input type="number" class="form-control" id="coverageWeight" 
                                       value="${weights.coverageWeight}" min="0" max="100" step="1">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="alert alert-info">
                                    <strong>Total:</strong> <span id="totalWeight">${weights.biodegradabilityWeight + weights.coralSafetyWeight + weights.fishSafetyWeight + weights.coverageWeight}%</span>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-ocean" onclick="saveWeights()">
                                <i class="fas fa-save"></i> Save Weights
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="resetWeights()">
                                <i class="fas fa-undo"></i> Reset to Defaults
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add event listeners for weight calculation
        ['biodegradabilityWeight', 'coralSafetyWeight', 'fishSafetyWeight', 'coverageWeight'].forEach(id => {
            document.getElementById(id).addEventListener('input', updateTotalWeight);
        });
        
    } catch (error) {
        console.error('Error loading weights:', error);
        content.innerHTML = '<div class="alert alert-danger">Failed to load weights.</div>';
    }
}

function updateTotalWeight() {
    const biodegradability = parseInt(document.getElementById('biodegradabilityWeight').value) || 0;
    const coralSafety = parseInt(document.getElementById('coralSafetyWeight').value) || 0;
    const fishSafety = parseInt(document.getElementById('fishSafetyWeight').value) || 0;
    const coverage = parseInt(document.getElementById('coverageWeight').value) || 0;
    
    const total = biodegradability + coralSafety + fishSafety + coverage;
    document.getElementById('totalWeight').textContent = total + '%';
    
    // Change color based on total
    const totalElement = document.getElementById('totalWeight');
    if (total === 100) {
        totalElement.className = 'text-success fw-bold';
    } else {
        totalElement.className = 'text-danger fw-bold';
    }
}

function saveWeights() {
    const weights = {
        biodegradabilityWeight: parseInt(document.getElementById('biodegradabilityWeight').value),
        coralSafetyWeight: parseInt(document.getElementById('coralSafetyWeight').value),
        fishSafetyWeight: parseInt(document.getElementById('fishSafetyWeight').value),
        coverageWeight: parseInt(document.getElementById('coverageWeight').value)
    };
    
    const total = weights.biodegradabilityWeight + weights.coralSafetyWeight + 
                 weights.fishSafetyWeight + weights.coverageWeight;
    
    if (total !== 100) {
        alert('Total weight must equal 100%. Current total: ' + total + '%');
        return;
    }
    
    localStorage.setItem('oceanScoreWeights', JSON.stringify(weights));
    alert('Weights saved successfully!');
}

function resetWeights() {
    const defaultWeights = {
        biodegradabilityWeight: 25,
        coralSafetyWeight: 30,
        fishSafetyWeight: 25,
        coverageWeight: 20
    };
    
    document.getElementById('biodegradabilityWeight').value = defaultWeights.biodegradabilityWeight;
    document.getElementById('coralSafetyWeight').value = defaultWeights.coralSafetyWeight;
    document.getElementById('fishSafetyWeight').value = defaultWeights.fishSafetyWeight;
    document.getElementById('coverageWeight').value = defaultWeights.coverageWeight;
    
    updateTotalWeight();
}
