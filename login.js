
document.addEventListener('DOMContentLoaded', () => {


    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const tfaSection = document.getElementById('tfa-section');

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const tfaCodeInput = document.getElementById('tfa-code');

    const loginButton = document.getElementById('login-button');
    const verifyButton = document.getElementById('verify-button');
    const messageArea = document.getElementById('message-area');

    let currentUsername = '';


    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Giriş Yapılıyor...';
        messageArea.textContent = '';

        const loginData = {
            username: usernameInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                currentUsername = result.username; 
                loginSection.style.display = 'none';
                tfaSection.style.display = 'block';
                messageArea.textContent = result.message;
                messageArea.style.color = 'lightblue';
            } else {
                messageArea.textContent = result.message;
                messageArea.style.color = 'red';
            }
        } catch (error) {
            console.error('Giriş isteği sırasında hata:', error);
            messageArea.textContent = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
            messageArea.style.color = 'red';
        } finally {
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Giriş Yap';
        }
    });

    verifyButton.addEventListener('click', async () => {
        
        const code = tfaCodeInput.value;

        if (!code || code.length !== 6) {
            messageArea.textContent = 'Lütfen 6 haneli kodu girin.';
            messageArea.style.color = 'orange';
            return;
        }

        verifyButton.disabled = true;
        verifyButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Doğrulanıyor...';
        messageArea.textContent = '';

        const tfaData = {
            username: currentUsername,
            code: code
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tfaData)
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', result.token);
                messageArea.textContent = result.message;
                messageArea.style.color = 'green';
                tfaModal.hide(); 
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            } else {
                messageArea.textContent = result.message;
                messageArea.style.color = 'red';
            }
        } catch (error) {
            console.error('Doğrulama isteği sırasında hata:', error);
            messageArea.textContent = 'Doğrulama sunucusuna bağlanılamadı.';
            messageArea.style.color = 'red';
        } finally {
            verifyButton.disabled = false;
            verifyButton.innerHTML = '<i class="fas fa-check-circle me-2"></i> Doğrula';
        }
    });
});