// Simple script to test login API
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit');
const resultDiv = document.getElementById('result');

// Add event listener to form
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Disable the submit button
  submitButton.disabled = true;
  submitButton.textContent = 'Logging in...';
  
  try {
    // Make API request
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: emailInput.value.toLowerCase(),
        password: passwordInput.value
      }),
      credentials: 'include'
    });
    
    // Parse response
    const data = await response.json();
    
    // Display result
    if (response.ok) {
      resultDiv.innerHTML = `<div class="success">Login successful! User data: <pre>${JSON.stringify(data, null, 2)}</pre></div>`;
    } else {
      resultDiv.innerHTML = `<div class="error">Login failed: ${data.error}</div>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  } finally {
    // Re-enable the submit button
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
  }
});