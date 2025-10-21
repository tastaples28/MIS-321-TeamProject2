// Admin Portal JavaScript - API Connected Version

// API Configuration
const API_BASE = 'http://localhost:5001/api';

// Global variables
let users = [];
let products = [];
let ingredients = [];
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

// Load data from API
async function loadData() {
    try {
        await Promise.all([
            loadUsers(),
            loadProducts(),
            loadIngredients(),
            loadOceanScoreWeights(),
            loadAnalytics()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data from API. Make sure the API server is running.');
    }
}

// Load users from API
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        if (response.ok) {
            users = await response.json();
            renderUsersTable();
        } else {
            throw new Error('Failed to fetch users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to empty array
        users = [];
    }
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            renderProductsTable();
        } else {
            throw new Error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
}

// Load ingredients from API
async function loadIngredients() {
    try {
        const response = await fetch(`${API_BASE}/ingredients`);
        if (response.ok) {
            ingredients = await response.json();
        } else {
            throw new Error('Failed to fetch ingredients');
        }
    } catch (error) {
        console.error('Error loading ingredients:', error);
        ingredients = [];
    }
}

// Load ocean score weights from API
async function loadOceanScoreWeights() {
    try {
        const response = await fetch(`${API_BASE}/admin/ocean-score-weights`);
        if (response.ok) {
            const weights = await response.json();
            oceanScoreWeights = {
                biodegradability: Math.round(weights.biodegradabilityWeight * 100),
                coral: Math.round(weights.coralSafetyWeight * 100),
                fish: Math.round(weights.fishSafetyWeight * 100),
                coverage: Math.round(weights.coverageWeight * 100)
            };
            updateWeightsChart();
        } else {
            throw new Error('Failed to fetch ocean score weights');
        }
    } catch (error) {
        console.error('Error loading ocean score weights:', error);
    }
}

// Load analytics from API
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics`);
        if (response.ok) {
            const data = await response.json();
            analytics = {
                searchCounts: data.searchCounts || {},
                favorites: data.favorites || {},
                clicks: data.clicks || {}
            };
            updateAnalyticsCharts();
        } else {
            throw new Error('Failed to fetch analytics');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Admin tab navigation
function showAdminTab(tabName) {
    // Hide all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// User management functions
function renderUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.isAdmin ? 'Admin' : 'User'}</td>
            <td>${user.sensitivityPreferences || 'N/A'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                ${!user.isAdmin ? `<button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function createUser() {
    const username = prompt('Enter username:');
    const email = prompt('Enter email:');
    const password = prompt('Enter password:');
    const sensitivity = prompt('Enter sensitivity preferences (optional):');
    
    if (!username || !email || !password) {
        alert('Username, email, and password are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                sensitivityPreferences: sensitivity || null
            })
        });
        
        if (response.ok) {
            alert('User created successfully!');
            loadUsers();
        } else {
            const error = await response.text();
            throw new Error(error);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user: ' + error.message);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/users/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + error.message);
    }
}

// Product management functions
function renderProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.brand}</td>
            <td>${product.category}</td>
            <td>${product.oceanScore}</td>
            <td>${product.biodegradabilityScore}</td>
            <td>${product.coralSafetyScore}</td>
            <td>${product.fishSafetyScore}</td>
            <td>${product.coverageScore}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function createProduct() {
    const name = prompt('Enter product name:');
    const brand = prompt('Enter brand:');
    const category = prompt('Enter category:');
    const description = prompt('Enter description (optional):');
    
    if (!name || !brand || !category) {
        alert('Name, brand, and category are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                brand: brand,
                category: category,
                description: description || null,
                ingredientIds: [] // You can enhance this to allow ingredient selection
            })
        });
        
        if (response.ok) {
            alert('Product created successfully!');
            loadProducts();
        } else {
            const error = await response.text();
            throw new Error(error);
        }
    } catch (error) {
        console.error('Error creating product:', error);
        alert('Failed to create product: ' + error.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    }
}

// Ocean Score Weights management
async function saveWeights() {
    const biodegradability = parseInt(document.getElementById('biodegradabilityWeight').value);
    const coralSafety = parseInt(document.getElementById('coralSafetyWeight').value);
    const fishSafety = parseInt(document.getElementById('fishSafetyWeight').value);
    const coverage = parseInt(document.getElementById('coverageWeight').value);
    
    const total = biodegradability + coralSafety + fishSafety + coverage;
    
    if (total !== 100) {
        alert('Total weight must equal 100%. Current total: ' + total + '%');
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
        
        if (response.ok) {
            alert('Weights saved successfully! All product scores will be recalculated.');
            loadOceanScoreWeights();
        } else {
            throw new Error('Failed to save weights');
        }
    } catch (error) {
        console.error('Error saving weights:', error);
        alert('Failed to save weights: ' + error.message);
    }
}

// Chart functions (simplified versions)
function updateWeightsChart() {
    // Update weights chart with current data
    console.log('Updating weights chart with:', oceanScoreWeights);
}

function updateAnalyticsCharts() {
    // Update analytics charts with current data
    console.log('Updating analytics charts with:', analytics);
}

// Utility functions
function showError(message) {
    alert('Error: ' + message);
}

// Placeholder functions for features that need more complex implementation
function editUser(id) {
    alert('Edit user functionality would be implemented here for user ID: ' + id);
}

function editProduct(id) {
    alert('Edit product functionality would be implemented here for product ID: ' + id);
}
