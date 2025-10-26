// Admin Portal JavaScript with API Integration

// API Configuration - Use Heroku URL for production
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : 'https://reefrates-555b282e7634.herokuapp.com/api';

// Initialize data storage
let users = [];
let products = [];
let oceanScoreWeights = {
    biodegradability: 30,
    coral: 30,
    fish: 25,
    coverage: 15
};
let analytics = {
    searchCounts: {},
    favorites: {},
    clicks: {}
};

// Chart instances
let weightsChart, searchChart, favoritesChart, scoreDistChart, clicksChart;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showAdminTab('users');
});

// Load data from API or localStorage
async function loadData() {
    try {
        // Try to load from API first
        await loadUsersFromAPI();
        await loadProductsFromAPI();
        await loadWeightsFromAPI();
        await loadAnalyticsFromAPI();
    } catch (error) {
        console.log('API not available:', error);
        alert('Unable to connect to server. Please refresh the page.');
    }
}

// API Functions
async function loadUsersFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        if (response.ok) {
            const data = await response.json();
            // API returns array of users
            users = Array.isArray(data) ? data : [];
            console.log('Loaded users:', users);
            return;
        }
    } catch (error) {
        console.error('Failed to load users from API:', error);
    }
    throw new Error('API not available');
}

async function loadProductsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const data = await response.json();
            const apiProducts = data.products || data; // Handle both {products: []} and [] formats
            // Convert API format to our format
            products = apiProducts.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                score: p.oceanScore,
                harmfulIngredients: p.harmfulIngredients || [],
                image: p.imageUrl || `https://placehold.co/400x400/0EA5E9/FFFFFF?text=${encodeURIComponent(p.name.substring(0, 20))}`,
                reason: p.description || 'No description available'
            }));
            return;
        }
    } catch (error) {
        console.log('Failed to load products from API:', error);
    }
    throw new Error('API not available');
}

async function loadWeightsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/admin/ocean-score-weights`);
        if (response.ok) {
            const weights = await response.json();
            oceanScoreWeights = weights;
            return;
        }
    } catch (error) {
        console.log('Failed to load weights from API:', error);
    }
    throw new Error('API not available');
}

async function loadAnalyticsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/analytics/summary`);
        if (response.ok) {
            const data = await response.json();
            // Convert API format to our analytics format
            analytics = {
                totalSearches: data.totalSearches || 0,
                totalViews: data.totalProductViews || 0,
                totalFavorites: data.totalFavorites || 0,
                searchCounts: {},
                favorites: {},
                clicks: {}
            };
            
            // Populate from topProducts
            if (data.topProducts && Array.isArray(data.topProducts)) {
                data.topProducts.forEach(product => {
                    analytics.searchCounts[product.productName] = product.viewCount || 0;
                    analytics.favorites[product.productName] = product.favoriteCount || 0;
                    analytics.clicks[product.productName] = product.viewCount || 0;
                });
            }
            
            return;
        }
    } catch (error) {
        console.log('Failed to load analytics from API:', error);
    }
    throw new Error('API not available');
}

// All data now loaded from API only - stored in MySQL database on Heroku

// Save functions - API only (all data stored in MySQL database on Heroku)
async function saveUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        });
        if (response.ok) return;
    } catch (error) {
        console.error('Failed to save users to API:', error);
        alert('Failed to save users. Please try again.');
    }
}

async function saveProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products)
        });
        if (response.ok) return;
    } catch (error) {
        console.error('Failed to save products to API:', error);
        alert('Failed to save products. Please try again.');
    }
}

async function saveWeights() {
    const bio = parseInt(document.getElementById('biodegradability-weight').value);
    const coral = parseInt(document.getElementById('coral-weight').value);
    const fish = parseInt(document.getElementById('fish-weight').value);
    const coverage = parseInt(document.getElementById('coverage-weight').value);
    
    const total = bio + coral + fish + coverage;
    
    if (total !== 100) {
        alert(`Total weight must equal 100%. Current total: ${total}%`);
        return;
    }
    
    oceanScoreWeights = {
        biodegradability: bio,
        coral: coral,
        fish: fish,
        coverage: coverage
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/ocean-score-weights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(oceanScoreWeights)
        });
        if (response.ok) {
            alert('Ocean Score weights saved successfully!');
            updateWeightsChart();
            return;
        }
    } catch (error) {
        console.error('Failed to save weights to API:', error);
        alert('Failed to save weights. Please try again.');
        return;
    }
    
    alert('Ocean Score weights saved successfully!');
    updateWeightsChart();
}

async function saveAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/admin/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analytics)
        });
        if (response.ok) return;
    } catch (error) {
        console.error('Failed to save analytics to API:', error);
        alert('Failed to save analytics. Please try again.');
    }
}

// Tab Management
function showAdminTab(tabName, clickedButton) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.style.display = 'block';
    }
    
    // Add active class to button
    const buttonElement = clickedButton || document.querySelector(`[onclick*="showAdminTab('${tabName}')"]`);
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    // Load tab data
    switch(tabName) {
        case 'users':
            renderUsersTable();
            break;
        case 'products':
            renderProductsTable();
            break;
        case 'ocean-score':
            renderOceanScoreSettings();
            break;
        case 'analytics':
            renderAnalytics();
            break;
    }
}

// USER MANAGEMENT
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        if (!user) return '';
        
        // Map API user object to admin panel format
        const name = user.username || user.name || 'N/A';
        const email = user.email || 'N/A';
        const role = user.isAdmin ? 'Admin' : 'User';
        
        return `
        <tr>
            <td><strong>${name}</strong></td>
            <td>${email}</td>
            <td><span class="role-badge role-${role.toLowerCase()}">${role}</span></td>
            <td>
                <button class="btn-admin btn-admin-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-admin btn-admin-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

function openAddUserModal() {
    document.getElementById('user-modal-title').textContent = 'Add User';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal').classList.add('show');
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('user-modal-title').textContent = 'Edit User';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.username || user.name || '';
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-role').value = user.isAdmin ? 'Admin' : 'User';
    document.getElementById('user-modal').classList.add('show');
}

async function saveUser(event) {
    event.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const password = document.getElementById('user-password')?.value || 'tempPass123'; // Placeholder
    
    try {
        if (id) {
            // Update existing user
            const response = await fetch(`${API_BASE}/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                    sensitivityPreferences: null
            })
        });
        
            if (!response.ok) {
                const error = await response.text();
                alert(`Failed to update user: ${error}`);
                console.error('Failed to update user:', error);
                return;
            }
        } else {
            // Add new user - for now we'll skip this as it requires a password
            alert('Creating new users from admin panel requires a password. Please use the signup form.');
            return;
        }
        
        // Reload users from API
        await loadUsersFromAPI();
        renderUsersTable();
        closeUserModal();
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user. Please try again.');
    }
}

async function toggleUserStatus(id) {
    // Note: User status toggle is not currently supported by the API
    // The backend doesn't have a status field for users
    alert('User status toggle is not currently supported. Users are always active in the system.');
    console.log('toggleUserStatus called for user:', id);
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok || response.status === 204) {
            // Remove from local array
            users = users.filter(u => u.id !== id);
            renderUsersTable();
            console.log('User deleted successfully');
        } else {
            const error = await response.text();
            alert(`Failed to delete user: ${error}`);
            console.error('Failed to delete user:', error);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    }
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('show');
}

// PRODUCT MANAGEMENT
function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = products.map(product => {
        const scoreClass = product.score >= 80 ? 'text-success' : product.score >= 50 ? 'text-warning' : 'text-danger';
        const harmfulList = product.harmfulIngredients.length > 0 
            ? product.harmfulIngredients.join(', ') 
            : '<span class="text-muted">None</span>';
        
        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td><span class="badge bg-info">${product.category}</span></td>
                <td><strong class="${scoreClass}">${product.score}/100</strong></td>
                <td>${harmfulList}</td>
                <td>
                    <button class="btn-admin btn-admin-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-admin btn-admin-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
            </td>
            </tr>
        `;
    }).join('');
}

function openAddProductModal() {
    document.getElementById('product-modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').classList.add('show');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-score').value = product.score;
    document.getElementById('product-harmful').value = product.harmfulIngredients.join(', ');
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-reason').value = product.reason;
    document.getElementById('product-modal').classList.add('show');
}

async function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const score = parseInt(document.getElementById('product-score').value);
    const harmfulText = document.getElementById('product-harmful').value;
    const harmfulIngredients = harmfulText ? harmfulText.split(',').map(s => s.trim()).filter(s => s) : [];
    const image = document.getElementById('product-image').value || 
                  `https://placehold.co/400x400/0EA5E9/FFFFFF?text=${encodeURIComponent(name.substring(0, 20))}`;
    const reason = document.getElementById('product-reason').value;
    
    if (id) {
        // Update existing product
        const productIndex = products.findIndex(p => p.id === parseInt(id));
        products[productIndex] = { id: parseInt(id), name, category, score, harmfulIngredients, image, reason };
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, category, score, harmfulIngredients, image, reason });
        
        // Add to analytics
        analytics.searchCounts[name] = 0;
        analytics.favorites[name] = 0;
        analytics.clicks[name] = 0;
    }
    
    await saveProducts();
    await saveAnalytics();
    renderProductsTable();
    closeProductModal();
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const product = products.find(p => p.id === id);
    if (product) {
        delete analytics.searchCounts[product.name];
        delete analytics.favorites[product.name];
        delete analytics.clicks[product.name];
    }
    
    products = products.filter(p => p.id !== id);
    await saveProducts();
    await saveAnalytics();
    renderProductsTable();
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
}

// OCEAN SCORE SETTINGS
function renderOceanScoreSettings() {
    document.getElementById('biodegradability-weight').value = oceanScoreWeights.biodegradability;
    document.getElementById('coral-weight').value = oceanScoreWeights.coral;
    document.getElementById('fish-weight').value = oceanScoreWeights.fish;
    document.getElementById('coverage-weight').value = oceanScoreWeights.coverage;
    
    updateWeights();
    updateWeightsChart();
}

function updateWeights() {
    const bio = parseInt(document.getElementById('biodegradability-weight').value);
    const coral = parseInt(document.getElementById('coral-weight').value);
    const fish = parseInt(document.getElementById('fish-weight').value);
    const coverage = parseInt(document.getElementById('coverage-weight').value);
    
    document.getElementById('biodegradability-display').textContent = bio + '%';
    document.getElementById('coral-display').textContent = coral + '%';
    document.getElementById('fish-display').textContent = fish + '%';
    document.getElementById('coverage-display').textContent = coverage + '%';
    
    const total = bio + coral + fish + coverage;
    const totalElement = document.getElementById('total-weight');
    totalElement.textContent = total;
    
    // Change alert color based on total
    const alertElement = totalElement.closest('.alert');
    if (total === 100) {
        alertElement.className = 'alert alert-success mt-3';
        } else {
        alertElement.className = 'alert alert-danger mt-3';
    }
    
    if (weightsChart) {
        updateWeightsChart();
    }
}

function updateWeightsChart() {
    const ctx = document.getElementById('weightsChart').getContext('2d');
    
    if (weightsChart) {
        weightsChart.destroy();
    }
    
    weightsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Biodegradability', 'Coral Safety', 'Fish Safety', 'Coverage'],
            datasets: [{
                data: [
                    parseInt(document.getElementById('biodegradability-weight').value),
                    parseInt(document.getElementById('coral-weight').value),
                    parseInt(document.getElementById('fish-weight').value),
                    parseInt(document.getElementById('coverage-weight').value)
                ],
                backgroundColor: ['#10B981', '#0EA5E9', '#3B82F6', '#F59E0B']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ANALYTICS
function renderAnalytics() {
    // Update stats
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-products').textContent = products.length;
    
    const avgScore = products.reduce((sum, p) => sum + p.score, 0) / products.length;
    document.getElementById('avg-score').textContent = Math.round(avgScore);
    
    const totalClicks = Object.values(analytics.clicks).reduce((sum, c) => sum + c, 0);
    document.getElementById('total-clicks').textContent = totalClicks;
    
    // Render charts
    renderSearchChart();
    renderFavoritesChart();
    renderScoreDistChart();
    renderClicksChart();
}

function renderSearchChart() {
    const ctx = document.getElementById('searchChart').getContext('2d');
    
    if (searchChart) {
        searchChart.destroy();
    }
    
    // Get top 5 searched products
    const sorted = Object.entries(analytics.searchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    searchChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s[0].substring(0, 20) + '...'),
            datasets: [{
                label: 'Search Count',
                data: sorted.map(s => s[1]),
                backgroundColor: 'rgba(14, 165, 233, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderFavoritesChart() {
    const ctx = document.getElementById('favoritesChart').getContext('2d');
    
    if (favoritesChart) {
        favoritesChart.destroy();
    }
    
    // Get top 5 favorited products
    const sorted = Object.entries(analytics.favorites)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    favoritesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s[0].substring(0, 20) + '...'),
            datasets: [{
                label: 'Favorites Count',
                data: sorted.map(s => s[1]),
                backgroundColor: 'rgba(248, 113, 113, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderScoreDistChart() {
    const ctx = document.getElementById('scoreDistChart').getContext('2d');
    
    if (scoreDistChart) {
        scoreDistChart.destroy();
    }
    
    // Calculate distribution
    const safe = products.filter(p => p.score >= 80).length;
    const moderate = products.filter(p => p.score >= 50 && p.score < 80).length;
    const harmful = products.filter(p => p.score < 50).length;
    
    scoreDistChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Safe (80-100)', 'Moderate (50-79)', 'Harmful (0-49)'],
            datasets: [{
                data: [safe, moderate, harmful],
                backgroundColor: ['#10B981', '#F59E0B', '#F87171']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderClicksChart() {
    const ctx = document.getElementById('clicksChart').getContext('2d');
    
    if (clicksChart) {
        clicksChart.destroy();
    }
    
    // Get top 5 clicked products
    const sorted = Object.entries(analytics.clicks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    clicksChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(s => s[0].substring(0, 20) + '...'),
            datasets: [{
                label: 'Link Clicks',
                data: sorted.map(s => s[1]),
                backgroundColor: 'rgba(16, 185, 129, 0.8)'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Close modals on outside click
document.getElementById('user-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeUserModal();
    }
});

document.getElementById('product-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});