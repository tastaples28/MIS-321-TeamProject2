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
        console.log('API not available, using local data:', error);
        // Fallback to localStorage
        loadDataFromLocalStorage();
    }
}

// API Functions
async function loadUsersFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        if (response.ok) {
            users = await response.json();
            return;
        }
    } catch (error) {
        console.log('Failed to load users from API:', error);
    }
    throw new Error('API not available');
}

async function loadProductsFromAPI() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const apiProducts = await response.json();
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
        const response = await fetch(`${API_BASE}/admin/analytics`);
        if (response.ok) {
            analytics = await response.json();
            return;
        }
    } catch (error) {
        console.log('Failed to load analytics from API:', error);
    }
    throw new Error('API not available');
}

// Local Storage Fallback
function loadDataFromLocalStorage() {
    // Load users
    const storedUsers = localStorage.getItem('adminUsers');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // Default users
        users = [
            { id: 1, name: 'John Admin', email: 'admin@reefrates.com', role: 'Admin', status: 'Active' },
            { id: 2, name: 'Sarah Manager', email: 'sarah@reefrates.com', role: 'Employee', status: 'Active' },
            { id: 3, name: 'Mike Smith', email: 'mike@email.com', role: 'User', status: 'Active' },
            { id: 4, name: 'Emily Johnson', email: 'emily@email.com', role: 'User', status: 'Active' },
            { id: 5, name: 'David Lee', email: 'david@email.com', role: 'Employee', status: 'Inactive' }
        ];
        saveUsers();
    }
    
    // Load products (sync with lookup.html data)
    const storedProducts = localStorage.getItem('adminProducts');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Default products matching lookup.html
        products = [
            { id: 1, name: 'Blue Lagoon Mineral Sunscreen SPF 50', category: 'sunscreen', score: 95, harmfulIngredients: [], reason: 'Uses zinc oxide and titanium dioxide for UV protection.', image: 'https://placehold.co/400x400/4ADE80/FFFFFF?text=Mineral+Sunscreen' },
            { id: 2, name: 'BeachGuard Chemical Sunscreen SPF 30', category: 'sunscreen', score: 25, harmfulIngredients: ['oxybenzone', 'octinoxate', 'parabens'], reason: 'Contains harmful chemicals that damage coral reefs.', image: 'https://placehold.co/400x400/F87171/FFFFFF?text=Chemical+Sunscreen' },
            { id: 3, name: 'Coral Safe Sport Sunscreen SPF 45', category: 'sunscreen', score: 88, harmfulIngredients: [], reason: 'Reef-friendly formula with mineral protection.', image: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=Sport+Sunscreen' },
            { id: 4, name: 'Ocean Breeze Natural Shampoo', category: 'shampoo', score: 82, harmfulIngredients: [], reason: 'Plant-based formula with biodegradable ingredients.', image: 'https://placehold.co/400x400/14B8A6/FFFFFF?text=Natural+Shampoo' },
            { id: 5, name: 'Salon Pro Ultra Shine Shampoo', category: 'shampoo', score: 42, harmfulIngredients: ['parabens'], reason: 'Contains parabens and synthetic sulfates.', image: 'https://placehold.co/400x400/FB923C/FFFFFF?text=Salon+Shampoo' },
            { id: 6, name: 'Eco-Wave Organic Shampoo', category: 'shampoo', score: 91, harmfulIngredients: [], reason: '100% organic formula with natural cleansers.', image: 'https://placehold.co/400x400/10B981/FFFFFF?text=Organic+Shampoo' },
            { id: 7, name: 'Silk Waves Natural Conditioner', category: 'conditioner', score: 78, harmfulIngredients: [], reason: 'Natural oils and plant-based ingredients.', image: 'https://placehold.co/400x400/06B6D4/FFFFFF?text=Natural+Conditioner' },
            { id: 8, name: 'Pro Salon Deep Conditioner', category: 'conditioner', score: 38, harmfulIngredients: ['parabens'], reason: 'Heavy use of silicones and parabens.', image: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Salon+Conditioner' },
            { id: 9, name: 'Reef-Friendly Repair Conditioner', category: 'conditioner', score: 86, harmfulIngredients: [], reason: 'Marine-safe ingredients with plant proteins.', image: 'https://placehold.co/400x400/22C55E/FFFFFF?text=Repair+Conditioner' },
            { id: 10, name: 'Tropical Clean Body Wash', category: 'body wash', score: 73, harmfulIngredients: [], reason: 'Uses mostly natural surfactants.', image: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=Tropical+Wash' },
            { id: 11, name: 'Antibacterial Deep Clean Body Wash', category: 'body wash', score: 31, harmfulIngredients: ['parabens'], reason: 'Contains triclosan and parabens.', image: 'https://placehold.co/400x400/DC2626/FFFFFF?text=Antibacterial' },
            { id: 12, name: 'Pure Ocean Organic Body Wash', category: 'body wash', score: 89, harmfulIngredients: [], reason: 'Certified organic with plant-based ingredients.', image: 'https://placehold.co/400x400/059669/FFFFFF?text=Organic+Wash' },
            { id: 13, name: 'Bronze Goddess Tanning Oil', category: 'tanning oil', score: 45, harmfulIngredients: ['parabens'], reason: 'Contains mineral oils and synthetic fragrances.', image: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=Bronze+Oil' },
            { id: 14, name: 'Eco-Tan Natural Tanning Oil', category: 'tanning oil', score: 76, harmfulIngredients: [], reason: 'Plant-based oils that are biodegradable.', image: 'https://placehold.co/400x400/14B8A6/FFFFFF?text=Natural+Oil' },
            { id: 15, name: 'Island Glow Tanning Accelerator', category: 'tanning oil', score: 28, harmfulIngredients: ['oxybenzone', 'octinoxate'], reason: 'Contains harmful chemicals for coral reefs.', image: 'https://placehold.co/400x400/B91C1C/FFFFFF?text=Accelerator' },
            { id: 16, name: 'Aqua Silk Body Lotion', category: 'body lotion', score: 81, harmfulIngredients: [], reason: 'Natural moisturizers with minimal synthetics.', image: 'https://placehold.co/400x400/06B6D4/FFFFFF?text=Aqua+Silk' },
            { id: 17, name: 'Ultra Hydrate Body Lotion', category: 'body lotion', score: 36, harmfulIngredients: ['parabens'], reason: 'Heavy use of parabens and synthetic emulsifiers.', image: 'https://placehold.co/400x400/F97316/FFFFFF?text=Ultra+Hydrate' },
            { id: 18, name: 'Marine Glow Reef-Safe Lotion', category: 'body lotion', score: 93, harmfulIngredients: [], reason: '100% reef-safe ingredients.', image: 'https://placehold.co/400x400/16A34A/FFFFFF?text=Marine+Glow' }
        ];
        saveProducts();
    }
    
    // Load weights
    const storedWeights = localStorage.getItem('oceanScoreWeights');
    if (storedWeights) {
        oceanScoreWeights = JSON.parse(storedWeights);
    }
    
    // Load analytics
    const storedAnalytics = localStorage.getItem('adminAnalytics');
    if (storedAnalytics) {
        analytics = JSON.parse(storedAnalytics);
    } else {
        // Generate dummy analytics
        products.forEach(p => {
            analytics.searchCounts[p.name] = Math.floor(Math.random() * 500) + 50;
            analytics.favorites[p.name] = Math.floor(Math.random() * 200) + 10;
            analytics.clicks[p.name] = Math.floor(Math.random() * 300) + 20;
        });
        saveAnalytics();
    }
}

// Save functions (try API first, fallback to localStorage)
async function saveUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        });
        if (response.ok) return;
    } catch (error) {
        console.log('Failed to save users to API, using localStorage:', error);
    }
    localStorage.setItem('adminUsers', JSON.stringify(users));
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
        console.log('Failed to save products to API, using localStorage:', error);
    }
    localStorage.setItem('adminProducts', JSON.stringify(products));
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
        console.log('Failed to save weights to API, using localStorage:', error);
    }
    
    localStorage.setItem('oceanScoreWeights', JSON.stringify(oceanScoreWeights));
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
        console.log('Failed to save analytics to API, using localStorage:', error);
    }
    localStorage.setItem('adminAnalytics', JSON.stringify(analytics));
}

// Tab Management
function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Add active class to button
    event.target.classList.add('active');
    
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
    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>
                <button class="btn-admin btn-admin-primary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-admin btn-admin-warning" onclick="toggleUserStatus(${user.id})">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="btn-admin btn-admin-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
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
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-status').value = user.status;
    document.getElementById('user-modal').classList.add('show');
}

async function saveUser(event) {
    event.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const status = document.getElementById('user-status').value;
    
    if (id) {
        // Update existing user
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        users[userIndex] = { id: parseInt(id), name, email, role, status };
    } else {
        // Add new user
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({ id: newId, name, email, role, status });
    }
    
    await saveUsers();
    renderUsersTable();
    closeUserModal();
}

async function toggleUserStatus(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    await saveUsers();
    renderUsersTable();
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    users = users.filter(u => u.id !== id);
    await saveUsers();
    renderUsersTable();
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
        type: 'horizontalBar',
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