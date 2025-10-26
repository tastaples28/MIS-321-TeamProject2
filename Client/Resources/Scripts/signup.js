// Signup page JavaScript

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthBar = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '';
        return;
    }
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = strength + '%';
    
    if (strength <= 25) {
        strengthBar.style.backgroundColor = '#EF4444';
    } else if (strength <= 50) {
        strengthBar.style.backgroundColor = '#F59E0B';
    } else if (strength <= 75) {
        strengthBar.style.backgroundColor = '#3B82F6';
    } else {
        strengthBar.style.backgroundColor = '#10B981';
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const sensitivity = document.getElementById('sensitivity').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match! Please try again.');
        return;
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
    submitButton.disabled = true;
    
    // Use the API registration function
    registerUser(username, email, password, sensitivity).then(result => {
        if (result.success) {
            // Show success animation
            const form = document.getElementById('signupForm');
            form.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--sea-green);"></i>
                    <h4 class="mt-3" style="color: var(--sea-green);">Account Created!</h4>
                    <p class="text-muted">Welcome to Reef Rates, ${result.user.username}!</p>
                    <p class="text-muted">Redirecting to product lookup...</p>
                </div>
            `;
            
            // Redirect to lookup page after short delay
            setTimeout(() => {
                window.location.href = 'lookup.html';
            }, 2000);
        } else {
            // Show error message
            alert('Registration failed: ' + result.message);
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }).catch(error => {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

