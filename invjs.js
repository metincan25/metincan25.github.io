// invlogin.js - TÜM GİRİŞ SAYFASI MANTIĞI

document.addEventListener('DOMContentLoaded', () => {
    console.log("Login script'i başarıyla yüklendi.");

    //---------------------------------------------//
    // 1. GEREKLİ TÜM HTML ELEMANLARINI SEÇME
    //---------------------------------------------//
    const body = document.body;
    
    // İnteraktif panel elemanları
    const brandingSection = document.getElementById('branding-section');
    const exitHandle = document.getElementById('exit-fullscreen-handle');

    // Ana form elemanları
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password-checkbox');
    const loginButton = document.getElementById('login-button');
    const messageArea = document.getElementById('message-area');
    
    // Bootstrap Modal ile ilgili elemanlar
    const tfaModalElement = document.getElementById('tfaModal');
    const tfaCodeInput = document.getElementById('tfa-code');
    const verifyButton = document.getElementById('verify-button');
    const modalMessageArea = document.getElementById('modal-message-area');
    
    // Hata kontrolü: Eğer kritik bir eleman bulunamazsa, script çökmesin, konsola hata bassın.
    if (!loginForm || !tfaModalElement || !verifyButton) {
        console.error("Kritik form veya modal elemanları HTML'de bulunamadı. Lütfen ID'leri kontrol edin.");
        return; 
    }
    
    const tfaModal = new bootstrap.Modal(tfaModalElement);
    let currentUsername = '';

    //---------------------------------------------//
    // 2. İNTERAKTİF PANEL EFEKTLERİ
    //---------------------------------------------//
    if (brandingSection && exitHandle) {
        brandingSection.addEventListener('mouseenter', () => body.classList.add('fullscreen-view'));
        exitHandle.addEventListener('mouseenter', () => body.classList.remove('fullscreen-view'));
    }

    //---------------------------------------------//
    // 3. ŞİFREYİ GÖSTERME ÖZELLİĞİ
    //---------------------------------------------//
    if (passwordInput && showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener('change', () => {
            passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
        });
    }

    //---------------------------------------------//
    // 4. GİRİŞ VE 2FA FORM MANTIĞI
    //---------------------------------------------//
    
    // --- 1. AŞAMA: KULLANICI ADI VE ŞİFRE GİRİŞİ ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Giriş Yapılıyor...';
        messageArea.textContent = '';

        const loginData = {
            username: usernameInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch('https://localhost:7038/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();
            if (response.ok) {
                currentUsername = result.username;
                if(tfaCodeInput) tfaCodeInput.value = '';
                const timerDisplay = document.getElementById('tfa-timer');
                const resendContainer = document.getElementById('tfa-resend-container');
                const verifyButton = document.getElementById('verify-button');
                startTimer(60, timerDisplay, resendContainer, verifyButton);
                tfaModal.show();
            } else {
                messageArea.textContent = result.message || 'Bilinmeyen bir hata oluştu.';
                messageArea.style.color = 'red';
            }
        } catch (error) {
            console.error('Giriş isteği sırasında hata:', error);
            messageArea.textContent = 'Sunucuya bağlanılamadı.';
            messageArea.style.color = 'red';
        } finally {
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Giriş Yap';
        }
    });

    // --- 2. AŞAMA: 2FA KODUNU DOĞRULAMA (MODAL İÇİNDE) ---
    verifyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const code = tfaCodeInput.value;
        if (!code || code.length !== 6) {
            modalMessageArea.textContent = 'Lütfen 6 haneli kodu girin.';
            modalMessageArea.style.color = 'orange';
            return;
        }

        verifyButton.disabled = true;
        verifyButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Doğrulanıyor...';
        modalMessageArea.textContent = '';

        const tfaData = {
            username: currentUsername,
            code: code
        };

        try {
            const response = await fetch('https://localhost:7038/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tfaData)
            });
            
            // Cevabı önce metin olarak alalım, ne geldiğini görelim
            const responseText = await response.text();
            
            if (!response.ok) {
                // Hatalı cevapları JSON olarak ayrıştırmayı dene
                try {
                    const errorResult = JSON.parse(responseText);
                    throw new Error(errorResult.message || `Sunucu hatası: ${response.status}`);
                } catch {
                    throw new Error(`Sunucu hatası: ${response.status}`);
                }
            }

            // Başarılı cevabı JSON olarak ayrıştır
            const result = JSON.parse(responseText);

            if (result.token) {
                // BAŞARILI: Token'ı sakla, modalı kapat ve yönlendir.
                localStorage.setItem('authToken', result.token);
                modalMessageArea.textContent = result.message || "Giriş başarılı!";
                modalMessageArea.style.color = 'green';
                
                setTimeout(() => {
                    tfaModal.hide();
                    window.location.href = 'index.html'; 
                }, 1000);
            } else {
                // Cevap başarılı (200 OK) ama içinde token yok! Bu bir backend hatasıdır.
                throw new Error('Giriş başarılı ancak sunucudan token alınamadı.');
            }
        } catch (error) {
            console.error('Doğrulama hatası:', error);
            modalMessageArea.textContent = error.message;
            modalMessageArea.style.color = 'red';
        } finally {
            verifyButton.disabled = false;
            verifyButton.innerHTML = '<i class="fas fa-check-circle me-2"></i> Doğrula';
        }
    });
    // login-final.js dosyasının sonlarına doğru ekle

   let timerInterval; // Sayacı durdurabilmek için global bir değişkende tutalım

   function startTimer(durationInSeconds, displayElement, resendContainer, verifyButton) {
    let timer = durationInSeconds;
    let minutes, seconds;

    // Önceki sayaç varsa temizle
    clearInterval(timerInterval);
    
    resendContainer.style.display = 'none'; // "Yeniden gönder" linkini gizle
    verifyButton.disabled = false; // "Doğrula" butonunu aktif et

    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        displayElement.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(timerInterval);
            displayElement.textContent = "Süre Doldu!";
            resendContainer.style.display = 'block'; // "Yeniden gönder" linkini göster
            verifyButton.disabled = true; // "Doğrula" butonunu pasif yap
        }
    }, 1000);
}
});