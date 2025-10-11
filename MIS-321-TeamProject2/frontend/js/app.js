// API Configuration
const API_BASE = 'https://localhost:7001/api'; // Update this to match your API port

// Global variables
let currentUser = null;
let currentProductId = null;
let favorites = [];
let currentPage = 1;
let totalPages = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing application');
  loadFavorites();
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
  const searchTerm = document.getElementById('search-term').value;
  const category = document.getElementById('category-filter').value;
  const minScore = parseInt(document.getElementById('min-score').value) || 0;
  const maxScore = parseInt(document.getElementById('max-score').value) || 100;
  
  showLoading(true);
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (category) params.append('category', category);
    if (minScore > 0) params.append('minOceanScore', minScore);
    if (maxScore < 100) params.append('maxOceanScore', maxScore);
    params.append('page', currentPage);
    params.append('pageSize', 12);
    
    const response = await fetch(`${API_BASE}/products?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    
    displayProducts(data.products);
    updatePagination(data.totalCount, data.pageSize);
    
    // Log search analytics
    await logAnalytics('search', null, { searchTerm, category, minScore, maxScore });
    
  } catch (error) {
    console.error('Search error:', error);
    showError('Failed to search products. Make sure the API server is running.');
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
    const response = await fetch(`${API_BASE}/products/${productId}`);
    
    if (!response.ok) {
      throw new Error('Product not found');
    }
    
    const product = await response.json();
    
    // Log view analytics
    await logAnalytics('view', productId);
    
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
              <div class="ingredient-item ${ingredient.isReefSafe ? 'ingredient-safe' : 'ingredient-harmful'}">
                <i class="fas ${ingredient.isReefSafe ? 'fa-leaf' : 'fa-exclamation-triangle'}"></i>
                ${ingredient.name}
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
  const currentPageElement = document.querySelector('.page-section.active');
  if (currentPageElement) {
    const pageId = currentPageElement.id;
    if (pageId === 'products-page') {
      searchProducts(); // Refresh products page
    } else if (pageId === 'favorites-page') {
      loadFavorites(); // Refresh favorites page
    }
  }
}

// Favorites functions
async function loadFavorites() {
  // Load favorites from localStorage
  favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
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
    // Fetch favorite products from API
    const favoriteProducts = [];
    for (const productId of favorites) {
      try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        if (response.ok) {
          const product = await response.json();
          favoriteProducts.push(product);
        }
      } catch (error) {
        console.error(`Failed to load product ${productId}:`, error);
      }
    }
    
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
  
  // Simple client-side check for demo purposes
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
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data = await response.json();
    const products = data.products;
    
    content.innerHTML = `
      <div class="d-flex align-items-center mb-4">
        <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-section-header">
        <h4 class="mb-0">Products Management</h4>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span>Total Products: ${products.length}</span>
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
            ${products.map(product => `
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
    console.error('Error loading products:', error);
    content.innerHTML = '<div class="alert alert-danger">Failed to load products.</div>';
  }
}

async function loadAdminIngredients() {
  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/ingredients`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    
    const ingredients = await response.json();
    
    content.innerHTML = `
      <div class="d-flex align-items-center mb-4">
        <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-section-header">
        <h4 class="mb-0">Ingredients Management</h4>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span>Total Ingredients: ${ingredients.length}</span>
        <button class="btn btn-ocean" onclick="showAddIngredientForm()">
          <i class="fas fa-plus"></i> Add Ingredient
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Reef Safe</th>
              <th>Biodegradability</th>
              <th>Coral Safety</th>
              <th>Fish Safety</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${ingredients.map(ingredient => `
              <tr>
                <td>${ingredient.name}</td>
                <td>${ingredient.isReefSafe ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-danger">No</span>'}</td>
                <td>${ingredient.biodegradabilityScore}</td>
                <td>${ingredient.coralSafetyScore}</td>
                <td>${ingredient.fishSafetyScore}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" onclick="editIngredient(${ingredient.id})">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteIngredient(${ingredient.id})">
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
    console.error('Error loading ingredients:', error);
    content.innerHTML = '<div class="alert alert-danger">Failed to load ingredients.</div>';
  }
}

async function loadAdminUsers() {
  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/admin/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    
    const users = await response.json();
    
    content.innerHTML = `
      <div class="d-flex align-items-center mb-4">
        <img src="assets/logo/main-logo.png" alt="Ocean-Friendly Logo" class="logo-section-header">
        <h4 class="mb-0">Users Management</h4>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span>Total Users: ${users.length}</span>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? '<span class="badge bg-primary">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Error loading users:', error);
    content.innerHTML = '<div class="alert alert-danger">Failed to load users.</div>';
  }
}

async function loadAdminAnalytics() {
  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/analytics/summary`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    
    const data = await response.json();
    
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
              <h5 class="card-title text-warning">${data.averageOceanScore.toFixed(0)}</h5>
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
                    <td>${category.averageOceanScore.toFixed(0)}</td>
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
    console.error('Error loading analytics:', error);
    content.innerHTML = '<div class="alert alert-danger">Failed to load analytics.</div>';
  }
}

async function loadAdminWeights() {
  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/admin/ocean-score-weights`);
    if (!response.ok) throw new Error('Failed to fetch weights');
    
    const weights = await response.json();
    
    // Convert to percentage
    const biodegradabilityPercent = (weights.biodegradabilityWeight * 100).toFixed(0);
    const coralSafetyPercent = (weights.coralSafetyWeight * 100).toFixed(0);
    const fishSafetyPercent = (weights.fishSafetyWeight * 100).toFixed(0);
    const coveragePercent = (weights.coverageWeight * 100).toFixed(0);
    
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
                       value="${biodegradabilityPercent}" min="0" max="100" step="1">
              </div>
              <div class="col-md-6">
                <label for="coralSafetyWeight" class="form-label">Coral Safety Weight (%)</label>
                <input type="number" class="form-control" id="coralSafetyWeight" 
                       value="${coralSafetyPercent}" min="0" max="100" step="1">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="fishSafetyWeight" class="form-label">Fish Safety Weight (%)</label>
                <input type="number" class="form-control" id="fishSafetyWeight" 
                       value="${fishSafetyPercent}" min="0" max="100" step="1">
              </div>
              <div class="col-md-6">
                <label for="coverageWeight" class="form-label">Coverage Weight (%)</label>
                <input type="number" class="form-control" id="coverageWeight" 
                       value="${coveragePercent}" min="0" max="100" step="1">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12">
                <div class="alert alert-info">
                  <strong>Total:</strong> <span id="totalWeight">${parseInt(biodegradabilityPercent) + parseInt(coralSafetyPercent) + parseInt(fishSafetyPercent) + parseInt(coveragePercent)}%</span>
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
  const totalElement = document.getElementById('totalWeight');
  totalElement.textContent = total + '%';
  
  // Change color based on total
  const alertElement = totalElement.closest('.alert');
  if (total === 100) {
    alertElement.className = 'alert alert-success';
  } else {
    alertElement.className = 'alert alert-danger';
  }
}

async function saveWeights() {
  const biodegradability = parseInt(document.getElementById('biodegradabilityWeight').value);
  const coralSafety = parseInt(document.getElementById('coralSafetyWeight').value);
  const fishSafety = parseInt(document.getElementById('fishSafetyWeight').value);
  const coverage = parseInt(document.getElementById('coverageWeight').value);
  
  const total = biodegradability + coralSafety + fishSafety + coverage;
  
  if (total !== 100) {
    showError('Total weight must equal 100%. Current total: ' + total + '%');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/admin/ocean-score-weights`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        biodegradabilityWeight: biodegradability / 100,
        coralSafetyWeight: coralSafety / 100,
        fishSafetyWeight: fishSafety / 100,
        coverageWeight: coverage / 100
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save weights');
    }
    
    alert('Weights saved successfully! All product scores will be recalculated.');
  } catch (error) {
    console.error('Error saving weights:', error);
    showError('Failed to save weights.');
  }
}

async function resetWeights() {
  document.getElementById('biodegradabilityWeight').value = 30;
  document.getElementById('coralSafetyWeight').value = 30;
  document.getElementById('fishSafetyWeight').value = 25;
  document.getElementById('coverageWeight').value = 15;
  updateTotalWeight();
}

async function exportAnalytics() {
  try {
    window.location.href = `${API_BASE}/analytics/export/csv`;
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
  alert(message);
}

async function logAnalytics(action, productId = null, metadata = null) {
  try {
    await fetch(`${API_BASE}/analytics/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: null,
        productId: productId,
        action: action
      })
    });
  } catch (error) {
    console.error('Failed to log analytics:', error);
    // Don't show error to user for analytics failures
  }
}

// Placeholder functions for admin features that would require forms
function showAddProductForm() {
  alert('Add Product form would be implemented here');
}

function editProduct(id) {
  alert(`Edit Product ${id} form would be implemented here`);
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    alert('Product deleted successfully');
    loadAdminProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showError('Failed to delete product.');
  }
}

function showAddIngredientForm() {
  alert('Add Ingredient form would be implemented here');
}

function editIngredient(id) {
  alert(`Edit Ingredient ${id} form would be implemented here`);
}

async function deleteIngredient(id) {
  if (!confirm('Are you sure you want to delete this ingredient?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/ingredients/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete ingredient');
    }
    
    alert('Ingredient deleted successfully');
    loadAdminIngredients();
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    showError('Failed to delete ingredient.');
  }
}
