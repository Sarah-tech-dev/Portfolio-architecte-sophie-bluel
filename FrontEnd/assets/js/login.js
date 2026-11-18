const usersLoginApiPath = 'http://localhost:5678/api/users/login/';

const loginTag = document.getElementById('login');
const loginForm = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const errorMessage = loginForm.querySelector('.error-message');

async function getToken() {
        let content = JSON.stringify({ 
            email: email.value,
            password: password.value
        });

        let response = await fetch(usersLoginApiPath, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: content
        });

        if (!response.ok) {
            errorMessage.removeAttribute('hidden');
            loginForm.addEventListener('click', () => {
                errorMessage.setAttribute('hidden', true);
            })
            return;
        } else {
            let data = await response.json();
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("userId", data.userId);
            window.location.href = "./index.html";
        }
};

function login() {
    loginTag.querySelector('.submit-btn').addEventListener('click', (evt) => {
        evt.preventDefault();
        getToken();
    })
};

login();
