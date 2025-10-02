document.addEventListener('DOMContentLoaded', () => {
    console.log("Login script'i başarıyla yüklendi.");
    
    // Sadece login formu olan sayfalarda çalış
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        console.log('Login form bulunamadı, invjs.js işlemleri atlanıyor.');
        return;
    }

    const body = document.body;
    const brandingSection = document.getElementById('branding-section');
    const exitHandle = document.getElementById('exit-fullscreen-handle');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password-checkbox');
    const loginButton = document.getElementById('login-button');
    const messageArea = document.getElementById('message-area');
    
    const tfaModalElement = document.getElementById('tfaModal');
    const tfaCodeInput = document.getElementById('tfa-code');
    const verifyButton = document.getElementById('verify-button');
    const modalMessageArea = document.getElementById('modal-message-area');
    
    // Kritik element kontrolleri
    if (!tfaModalElement) {
        console.error("TFA Modal HTML'de bulunamadı. Lütfen ID'yi kontrol edin.");
        return; 
    }
    
    const tfaModal = new bootstrap.Modal(tfaModalElement);
    let currentUsername = '';
    let timerInterval;

    // Branding section ve exit handle kontrollü
    if (brandingSection && exitHandle) {
        brandingSection.addEventListener('mouseenter', () => {
            if (body) body.classList.add('fullscreen-view');
        });
        exitHandle.addEventListener('mouseenter', () => {
            if (body) body.classList.remove('fullscreen-view');
        });
    }

    // Show password kontrollü
    if (passwordInput && showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener('change', () => {
            passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
        });
    }

    // TFA Modal açıldığında timer'ı başlat
    tfaModalElement.addEventListener('shown.bs.modal', function () {
        console.log('TFA Modal tamamen açıldı, elementler yüklendi');
        
        // HTML'deki ID'lere göre elementleri seç
        const timerDisplay = document.getElementById('tfa-timer'); // Bu var
        const verifyBtn = document.getElementById('verify-button'); // Bu var
        
        // Resend container HTML'de yok, o yüzden oluşturalım veya farklı yaklaşım kullanalım
        const resendContainer = document.getElementById('tfa-resend-container');

        console.log('Bulunan timer elementleri:', {
            timerDisplay: timerDisplay,
            verifyBtn: verifyBtn,
            resendContainer: resendContainer
        });
        
        if (timerDisplay && verifyBtn) {
            console.log('Timer elementleri bulundu, timer başlatılıyor...');
            // Resend container yoksa, timer bittiğinde verify butonunu devre dışı bırakacağız
            startTimer(60, timerDisplay, verifyBtn);
        } else {
            console.error('Timer elementleri bulunamadı!');
        }
    });

    // Login form submit
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Giriş Yapılıyor...';
        }
        
        if (messageArea) {
            messageArea.textContent = '';
        }

        const loginData = {
            username: usernameInput ? usernameInput.value : '',
            password: passwordInput ? passwordInput.value : ''
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
                
                if (tfaCodeInput) {
                    tfaCodeInput.value = '';
                }
                
                // SADECE MODALI AÇ, TIMER'I BAŞLATMA
                // Timer modal açıldığında otomatik başlayacak
                tfaModal.show();
                
            } else {
                if (messageArea) {
                    messageArea.textContent = result.message || 'Bilinmeyen bir hata oluştu.';
                    messageArea.style.color = 'red';
                }
            }
        } catch (error) {
            console.error('Giriş isteği sırasında hata:', error);
            if (messageArea) {
                messageArea.textContent = 'Sunucuya bağlanılamadı.';
                messageArea.style.color = 'red';
            }
        } finally {
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i> Giriş Yap';
            }
        }
    });

    // Verify buton event listener - kontrollü
    if (verifyButton) {
        verifyButton.addEventListener('click', async (event) => {
            event.preventDefault();
            
            const code = tfaCodeInput ? tfaCodeInput.value : '';
            if (!code || code.length !== 6) {
                if (modalMessageArea) {
                    modalMessageArea.textContent = 'Lütfen 6 haneli kodu girin.';
                    modalMessageArea.style.color = 'orange';
                }
                return;
            }

            verifyButton.disabled = true;
            verifyButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Doğrulanıyor...';
            
            if (modalMessageArea) {
                modalMessageArea.textContent = '';
            }

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
                
                const responseText = await response.text();
                
                if (!response.ok) {
                    try {
                        const errorResult = JSON.parse(responseText);
                        throw new Error(errorResult.message || `Sunucu hatası: ${response.status}`);
                    } catch {
                        throw new Error(`Sunucu hatası: ${response.status}`);
                    }
                }

                const result = JSON.parse(responseText);

                if (result.token) {
                    localStorage.setItem('authToken', result.token);
                    
                    if (modalMessageArea) {
                        modalMessageArea.textContent = result.message || "Giriş başarılı!";
                        modalMessageArea.style.color = 'green';
                    }
                    
                    // Timer'ı temizle
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }
                    
                    setTimeout(() => {
                        tfaModal.hide();
                        window.location.href = 'index.html'; 
                    }, 1000);
                } else {
                    throw new Error('Giriş başarılı ancak sunucudan token alınamadı.');
                }
            } catch (error) {
                console.error('Doğrulama hatası:', error);
                if (modalMessageArea) {
                    modalMessageArea.textContent = error.message;
                    modalMessageArea.style.color = 'red';
                }
            } finally {
                verifyButton.disabled = false;
                verifyButton.innerHTML = '<i class="fas fa-check-circle me-2"></i> Doğrula';
            }
        });
    }

    // Güncellenmiş Timer fonksiyonu (resend container olmadan)
    function startTimer(durationInSeconds, displayElement, verifyButton) {
        console.log('🚀 Timer başlatılıyor:', durationInSeconds);
        
        // Önceki timer'ı temizle
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        let timeLeft = durationInSeconds;
        
        // Başlangıç durumu
        verifyButton.disabled = false;

        // Timer fonksiyonu
        function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            const displayText = 
                (minutes < 10 ? "0" + minutes : minutes) + ":" + 
                (seconds < 10 ? "0" + seconds : seconds);
                
            displayElement.textContent = displayText;
            console.log('⏰ Sayaç:', displayText);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                displayElement.textContent = "Süre Doldu!";
                verifyButton.disabled = true;
                console.log('✅ Timer bitti!');
                
                // Süre dolduğunda kullanıcıya mesaj göster
                if (modalMessageArea) {
                    modalMessageArea.textContent = "Kodun süresi doldu. Lütfen yeni bir kod isteyin.";
                    modalMessageArea.style.color = 'orange';
                }
            }
            timeLeft--;
        }

        // Hemen başlat ve her saniye güncelle
        updateTimer(); // İlk çalıştırma
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Modal kapatıldığında timer'ı temizle
    tfaModalElement.addEventListener('hide.bs.modal', function () {
        console.log('Modal kapatıldı, timer temizleniyor');
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });
});