import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log("Attempting test login...");
    
    // Test login credentials
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'coachpete@86.com',
        password: '123456789'
      })
    });
    
    console.log("Login response status:", loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error("Login failed:", errorData);
      return;
    }
    
    const userData = await loginResponse.json();
    console.log("Login successful! User data:", userData);
  } catch (error) {
    console.error("Error during test login:", error);
  }
}

testLogin();