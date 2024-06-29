document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });
    
    const result = await response.text();
    alert(result);
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    if (result.token) {
        localStorage.setItem('token', result.token);
        alert('Login successful');
    } else {
        alert('Login failed');
    }
});

document.getElementById('fetch-users').addEventListener('click', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        return;
    }
    
    const response = await fetch('/users', {
        method: 'GET',
        headers: {
            'Authorization': token
        }
    });
    
    const users = await response.json();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email})`;
        userList.appendChild(li);
    });
});
