// Sayfanın tamamen yüklendiğinden emin oluyoruz
document.addEventListener('DOMContentLoaded', () => {

    // HTML'deki tüm ilgili elemanları id'lerine göre seçiyoruz
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const tfaSection = document.getElementById('tfa-section');

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const tfaCodeInput = document.getElementById('tfa-code');

    const loginButton = document.getElementById('login-button');
    const verifyButton = document.getElementById('verify-button');
    const messageArea = document.getElementById('message-area');

    // 2. aşamada kullanmak üzere kullanıcı adını saklayacak bir değişken
    let currentUsername = '';

    // --- 1. AŞAMA: KULLANICI ADI VE ŞİFRE GİRİŞİ ---
    loginForm.addEventListener('submit', async (event) => {
        // Formun varsayılan olarak sayfayı yenileme davranışını engelliyoruz
        event.preventDefault();

        // Butonu pasif hale getir ve metni değiştir
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Giriş Yapılıyor...';
        messageArea.textContent = '';

        const loginData = {
            username: usernameInput.value,
            password: passwordInput.value
        };

        try {
            // PORT NUMARASINI KENDİ PROJENİZE GÖRE GÜNCELLEYİN!
            const response = await fetch('https://localhost:7038/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                // Giriş başarılı, 2FA ekranını göster
                currentUsername = result.username; // Kullanıcı adını sonraki adım için sakla
                loginSection.style.display = 'none';
                tfaSection.style.display = 'block';
                messageArea.textContent = result.message;
                messageArea.style.color = 'lightblue';
            } else {
                // Giriş başarısız, hata mesajını göster
                messageArea.textContent = result.message;
                messageArea.style.color = 'red';
            }
        } catch (error) {
            console.error('Giriş isteği sırasında hata:', error);
            messageArea.textContent = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
            messageArea.style.color = 'red';
        } finally {
            // Butonu tekrar aktif hale getir ve metni eski haline döndür
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Giriş Yap';
        }
    });

    // --- 2. AŞAMA: 2FA KODUNU DOĞRULAMA ---
    verifyButton.addEventListener('click', async () => {
        
        const code = tfaCodeInput.value;

        if (!code || code.length !== 6) {
            messageArea.textContent = 'Lütfen 6 haneli kodu girin.';
            messageArea.style.color = 'orange';
            return;
        }

        // Butonu pasif hale getir ve metni değiştir
        verifyButton.disabled = true;
        verifyButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Doğrulanıyor...';
        messageArea.textContent = '';

        const tfaData = {
            username: currentUsername,
            code: code
        };

        try {
            // PORT NUMARASINI KENDİ PROJENİZE GÖRE GÜNCELLEYİN!
            const response = await fetch('https://localhost:7038/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tfaData)
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', result.token);
                // 2FA Doğrulaması başarılı, yönlendir!
                messageArea.textContent = result.message;
                messageArea.style.color = 'green';
                tfaModal.hide(); 
                // Kullanıcıya mesajı görmesi için kısa bir süre ver ve sonra yönlendir
                setTimeout(() => {
                    window.location.href = 'index.html'; // Yönlendirilecek ana sayfanız
                }, 1500);

            } else {
                // 2FA Kodu hatalı veya süresi dolmuş
                messageArea.textContent = result.message;
                messageArea.style.color = 'red';
            }
        } catch (error) {
            console.error('Doğrulama isteği sırasında hata:', error);
            messageArea.textContent = 'Doğrulama sunucusuna bağlanılamadı.';
            messageArea.style.color = 'red';
        } finally {
            // Butonu tekrar aktif hale getir
            verifyButton.disabled = false;
            verifyButton.innerHTML = '<i class="fas fa-check-circle me-2"></i> Doğrula';
        }
    });
});