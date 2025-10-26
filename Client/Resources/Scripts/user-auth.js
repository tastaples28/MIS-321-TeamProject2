// User Authentication and Favorites Management

// API Configuration - Use Heroku URL for production
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : 'https://reefrates-555b282e7634.herokuapp.com/api';

// Global user state
let currentUser = null;

// Initialize user authentication
document.addEventListener('DOMContentLoaded', function() {
    // Restore user from sessionStorage
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
});

// User Registration
async function registerUser(username, email, password, sensitivityPreferences = null) {
    try {
        const response = await fetch(`${API_BASE}/userauth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                sensitivityPreferences: sensitivityPreferences
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (error) {
            // If response is not JSON, get text instead
            const responseClone = response.clone();
            const text = await responseClone.text();
            return { success: false, message: text || 'Registration failed' };
        }

        if (response.ok && data.success) {
            currentUser = data.user;
            // Store in sessionStorage (session data only, not persistent user data)
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            return { success: true, message: data.message, user: data.user };
        } else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Registration failed. Please try again.' };
    }
}

// User Login
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE}/userauth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (error) {
            // If response is not JSON, get text instead
            const responseClone = response.clone();
            const text = await responseClone.text();
            return { success: false, message: text || 'Login failed' };
        }

        if (response.ok && data.success) {
            currentUser = data.user;
            // Store in sessionStorage (session data only, not persistent user data)
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            return { success: true, message: data.message, user: data.user };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please try again.' };
    }
}

// User Logout
function logoutUser() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
}

// Check if user is logged in
function isUserLoggedIn() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (!currentUser) return;

    // Update login/logout buttons
    const loginButtons = document.querySelectorAll('.login-button');
    const logoutButtons = document.querySelectorAll('.logout-button');
    const userInfo = document.querySelectorAll('.user-info');

    loginButtons.forEach(btn => btn.style.display = 'none');
    logoutButtons.forEach(btn => btn.style.display = 'inline-block');
    userInfo.forEach(info => {
        info.style.display = 'block';
        info.innerHTML = `Welcome, ${currentUser.username}!`;
    });

    // Show user-specific features
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    favoriteButtons.forEach(btn => btn.style.display = 'inline-block');

    // Load user's favorites
    loadUserFavorites();
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    // Update login/logout buttons
    const loginButtons = document.querySelectorAll('.login-button');
    const logoutButtons = document.querySelectorAll('.logout-button');
    const userInfo = document.querySelectorAll('.user-info');

    loginButtons.forEach(btn => btn.style.display = 'inline-block');
    logoutButtons.forEach(btn => btn.style.display = 'none');
    userInfo.forEach(info => {
        info.style.display = 'none';
        info.innerHTML = '';
    });

    // Hide user-specific features
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    favoriteButtons.forEach(btn => btn.style.display = 'none');
}

// Add product to favorites
async function addToFavorites(productId) {
    if (!currentUser) {
        alert('Please log in to add products to favorites');
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/userfavorites/${currentUser.id}/favorites/${productId}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            updateFavoriteButton(productId, true);
            return true;
        } else if (response.status === 409) {
            alert('This product is already in your favorites');
            return false;
        } else {
            throw new Error('Failed to add to favorites');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        alert('Failed to add product to favorites');
        return false;
    }
}

// Remove product from favorites
async function removeFromFavorites(productId) {
    if (!currentUser) {
        alert('Please log in to manage favorites');
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/userfavorites/${currentUser.id}/favorites/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            updateFavoriteButton(productId, false);
            return true;
        } else {
            throw new Error('Failed to remove from favorites');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        alert('Failed to remove product from favorites');
        return false;
    }
}

// Toggle favorite status
async function toggleFavorite(productId) {
    if (!currentUser) {
        alert('Please log in to manage favorites');
        return;
    }

    try {
        // First check current status
        const statusResponse = await fetch(`${API_BASE}/userfavorites/${currentUser.id}/favorites/${productId}/status`);
        const statusData = await statusResponse.json();

        if (statusData.isFavorite) {
            await removeFromFavorites(productId);
        } else {
            await addToFavorites(productId);
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Failed to update favorites');
    }
}

// Load user's favorites
async function loadUserFavorites() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/userfavorites/${currentUser.id}`);
        if (response.ok) {
            const favorites = await response.json();
            updateFavoriteButtons(favorites);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Update favorite buttons based on user's favorites
function updateFavoriteButtons(favorites) {
    const favoriteProductIds = favorites.map(p => p.id);
    
    document.querySelectorAll('.favorite-button').forEach(button => {
        const productId = parseInt(button.dataset.productId);
        const isFavorite = favoriteProductIds.includes(productId);
        updateFavoriteButton(productId, isFavorite);
    });
}

// Update individual favorite button
function updateFavoriteButton(productId, isFavorite) {
    const button = document.querySelector(`[data-product-id="${productId}"].favorite-button`);
    if (button) {
        if (isFavorite) {
            button.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            button.className = button.className.replace('btn-outline-danger', 'btn-danger');
        } else {
            button.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            button.className = button.className.replace('btn-danger', 'btn-outline-danger');
        }
    }
}

// Check favorite status for a product
async function checkFavoriteStatus(productId) {
    if (!currentUser) return false;

    try {
        const response = await fetch(`${API_BASE}/userfavorites/${currentUser.id}/favorites/${productId}/status`);
        if (response.ok) {
            const data = await response.json();
            return data.isFavorite;
        }
    } catch (error) {
        console.error('Error checking favorite status:', error);
    }
    return false;
}

// Get user's favorite count
async function getFavoriteCount() {
    if (!currentUser) return 0;

    try {
        const response = await fetch(`${API_BASE}/userfavorites/${currentUser.id}/favorites/count`);
        if (response.ok) {
            const data = await response.json();
            return data.count;
        }
    } catch (error) {
        console.error('Error getting favorite count:', error);
    }
    return 0;
}

// Simple registration form handler
function handleRegistration(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const sensitivity = document.getElementById('reg-sensitivity').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    registerUser(username, email, password, sensitivity).then(result => {
        if (result.success) {
            alert('Registration successful! Welcome, ' + result.user.username + '!');
            // Close registration modal or redirect
            const modal = document.getElementById('registrationModal');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }
        } else {
            alert('Registration failed: ' + result.message);
        }
    });
}

// Simple login form handler
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    loginUser(username, password).then(result => {
        if (result.success) {
            alert('Login successful! Welcome back, ' + result.user.username + '!');
            // Close login modal or redirect
            const modal = document.getElementById('loginModal');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }
        } else {
            alert('Login failed: ' + result.message);
        }
    });
}

// Logout handler
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        logoutUser();
        alert('You have been logged out successfully');
    }
}
