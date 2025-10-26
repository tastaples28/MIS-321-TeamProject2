// Login page JavaScript

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
    submitButton.disabled = true;
    
    // Use the API login function
    loginUser(username, password).then(result => {
        if (result.success) {
            // Show success animation
            const form = document.getElementById('loginForm');
            form.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                    <h4 class="mt-3 text-success">Login Successful!</h4>
                    <p class="text-muted">Welcome back, ${result.user.username}!</p>
                    <p class="text-muted">Redirecting to product lookup...</p>
                </div>
            `;
            
            // Redirect to lookup page after short delay
            setTimeout(() => {
                window.location.href = 'lookup.html';
            }, 1500);
        } else {
            // Show error message
            alert('Login failed: ' + result.message);
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }).catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

