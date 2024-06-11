//public/script.js
const ABCDEFGHZ = "VkVSRURCQVJPTjcz";
const messageDiv = document.getElementById('message');

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const secret_password = document.getElementById('secret-password-r').value;
        const isSecretPassword = btoa(secret_password) === ABCDEFGHZ;

        if (username && email && password && isSecretPassword) {
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "User registered successfully") {
                    showMessage("Registration successful");
                } else {
                    showMessage(data.message); // Show specific error message
                }
            })
            .catch(error => {
                showMessage("Error: " + error.message);
            });
        } else {
            showMessage("Please fill in all fields correctly.");
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        messageDiv.textContent = "Wrong Username/password/secret-code";

        if (username && password) {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/success'; // Redirect to /success upon successful login
                } else {
                    showMessage("Login failed");
                }
            })
            .catch(error => {
                showMessage("Error: " + error.message);
            });
        } else {
            showMessage("Please fill in all fields correctly.");
        }
    });

    function showMessage(msg) {
        messageDiv.textContent = msg;
    }
});
