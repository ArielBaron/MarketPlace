const messageDiv = document.createElement('div');
messageDiv.id = 'message';
document.body.appendChild(messageDiv);

document.addEventListener('DOMContentLoaded', () => {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
        const showPasswordBtn = document.createElement('button');
        showPasswordBtn.type = 'button';
        showPasswordBtn.textContent = 'Show';
        showPasswordBtn.style.marginLeft = '10px';
        
        showPasswordBtn.addEventListener('click', () => {
            if (field.type === 'password') {
                field.type = 'text';
                showPasswordBtn.textContent = 'Hide';
            } else {
                field.type = 'password';
                showPasswordBtn.textContent = 'Show';
            }
        });

        field.parentElement.insertBefore(showPasswordBtn, field.nextSibling);
    });
    
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const secret_password = document.getElementById('secret-password-r').value;

        if (username && email && password && secret_password) {
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, secret_password}),
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
                showMessage(`Error: ${error.message}`);
            });
        } else {
            showMessage("Please fill in all fields correctly.");
        }
    });

    function showMessage(msg) {
        // Create popup elements
        const popup = document.createElement('div');
        popup.className = 'popup';
        const messageText = document.createElement('div');
        messageText.textContent = msg;
        const countdown = document.createElement('div');
        countdown.className = 'countdown';
        let counter = 5;
        countdown.textContent = `Closing in ${counter} seconds`;
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.addEventListener('click', () => {
            clearInterval(interval);
            document.body.removeChild(popup);
        });

        // Append elements to popup
        popup.appendChild(messageText);
        popup.appendChild(countdown);
        popup.appendChild(okButton);
        document.body.appendChild(popup);

        // Countdown timer
        const interval = setInterval(() => {
            counter--;
            countdown.textContent = `Closing in ${counter} seconds`;
            if (counter === 0) {
                clearInterval(interval);
                document.body.removeChild(popup);
            }
        }, 1000);
    }
});
