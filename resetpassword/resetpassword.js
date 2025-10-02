document.addEventListener('DOMContentLoaded', () => {
    // API_BASE_URL kontrolü
    if (typeof API_BASE_URL === 'undefined') {
        console.error('API_BASE_URL tanımlı değil. config.js dosyasının yüklendiğinden emin olun.');
        showMessage('Sistem yapılandırmasında bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
        return;
    }

    const form = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageArea = document.getElementById('message-area');
    const resetButton = document.getElementById('reset-button');
    const passwordStrength = document.getElementById('password-strength');
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showMessage("Geçersiz veya eksik sıfırlama linki.", 'error');
        form.style.display = 'none'; 
        return;
    }

    // Şifre güçlülük kontrolü
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        updatePasswordStrength(password);
        
        if (this.value.trim() !== '') {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });

    // Şifre eşleşme kontrolü
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            if (this.value === newPasswordInput.value) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validasyon
        if (!newPassword || !confirmPassword) {
            showMessage("Lütfen tüm alanları doldurun.", 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("Girdiğiniz şifreler eşleşmiyor.", 'warning');
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordInput.focus();
            return;
        }

        if (newPassword.length < 8) {
            showMessage("Şifre en az 8 karakter olmalıdır.", 'warning');
            newPasswordInput.classList.add('is-invalid');
            newPasswordInput.focus();
            return;
        }

        // Loading state
        setLoadingState(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    token: token, 
                    newPassword: newPassword 
                })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message + " Giriş sayfasına yönlendiriliyorsunuz...", 'success');
                
                // Başarı animasyonu
                messageArea.classList.add('animate__animated', 'animate__bounceIn');
                
                // 3 saniye sonra giriş sayfasına yönlendir
                setTimeout(() => { 
                    window.location.href = 'invlogin.html'; 
                }, 3000);
            } else {
                showMessage(result.message || "Şifre sıfırlama işlemi başarısız oldu.", 'error');
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            showMessage("Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.", 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // Şifre güçlülük güncelleme
    function updatePasswordStrength(password) {
        if (!passwordStrength) return;
        
        let strength = 'Zayıf';
        let colorClass = 'strength-weak';
        let icon = 'fas fa-times-circle';
        
        if (password.length >= 8) {
            strength = 'Orta';
            colorClass = 'strength-medium';
            icon = 'fas fa-exclamation-circle';
        }
        if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
            strength = 'Güçlü';
            colorClass = 'strength-strong';
            icon = 'fas fa-check-circle';
        }
        
        passwordStrength.innerHTML = `<i class="${icon} me-1"></i> Şifre gücü: <span class="${colorClass} fw-bold">${strength}</span>`;
    }

    // Mesaj gösterme fonksiyonu
    function showMessage(message, type) {
        if (!messageArea) return;
        
        messageArea.textContent = message;
        messageArea.className = 'message-area';
        
        if (type) {
            messageArea.classList.add(type);
            messageArea.style.display = 'block';
            
            // Animasyon class'larını temizle
            setTimeout(() => {
                messageArea.classList.remove('animate__animated', 'animate__bounceIn');
            }, 1000);
        } else {
            messageArea.style.display = 'none';
        }
    }

    // Loading state yönetimi
    function setLoadingState(loading) {
        if (!resetButton) return;
        
        if (loading) {
            resetButton.classList.add('loading');
            resetButton.disabled = true;
            newPasswordInput.disabled = true;
            confirmPasswordInput.disabled = true;
        } else {
            resetButton.classList.remove('loading');
            resetButton.disabled = false;
            newPasswordInput.disabled = false;
            confirmPasswordInput.disabled = false;
        }
    }

    // Input focus efektleri
    [newPasswordInput, confirmPasswordInput].forEach(input => {
        if (input) {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
        }
    });
});