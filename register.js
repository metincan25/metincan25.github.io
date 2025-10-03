document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('register-form');
    const formWrapper = document.getElementById('form-wrapper');

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        formWrapper.innerHTML = `<div class="alert alert-danger">Geçersiz kayıt linki.</div>`;
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            alert('Lütfen "Ben robot değilim" doğrulamasını yapın.');
            return;
        }

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsChecked = document.getElementById('terms-check').checked;
        const kvkkChecked = document.getElementById('kvkk-check').checked;
        const eIletiChecked = document.getElementById('e-ileti-check').checked;


        if (password !== confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

 
        if (!termsChecked || !kvkkChecked) {
            alert('Kullanıcı Sözleşmesi ve KVKK Aydınlatma Metni\'ni kabul etmeniz gerekmektedir.');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Kayıt Yapılıyor...';

        const formData = {
            token: token,
            username: document.getElementById('username').value,
            password: password,
            confirmPassword: confirmPassword,
            companyName: document.getElementById('company-name').value,
            taxOffice: document.getElementById('tax-office').value,
            taxNumber: document.getElementById('tax-number').value,
            address: document.getElementById('address').value,
            acceptedTerms: termsChecked,
            acceptedKvkk: kvkkChecked,
            acceptedECommunication: eIletiChecked,
            recaptchaToken: recaptchaResponse
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/registration/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Kayıt işlemi başarısız oldu.');
            }
            
            // Başarılı kayıt
            formWrapper.innerHTML = `
                <div class="card shadow-lg text-center p-5 animate__animated animate__fadeIn">
                    <div class="card-body">
                        <div class="text-success mb-3">
                            <i class="fas fa-check-circle" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="text-success mb-3">${result.message || 'Kayıt işleminiz başarıyla tamamlandı!'}</h4>
                        <p class="text-muted mb-4">Hesabınız aktif edilmiştir. Giriş yapabilirsiniz.</p>
                        <a href="invlogin.html" class="btn btn-primary btn-lg">
                            <i class="fas fa-sign-in-alt me-2"></i>Giriş Yap
                        </a>
                    </div>
                </div>`;
                
        } catch (error) {
            console.error('Kayıt hatası:', error);
            

            grecaptcha.reset();
            

            const errorMessage = error.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
            

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show';
            alertDiv.innerHTML = `
                <strong>Hata!</strong> ${errorMessage}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

            form.insertBefore(alertDiv, form.firstChild);
            

            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-rocket me-2"></i>Kaydı Tamamla ve Giriş Yap';
        }
    });


    document.getElementById('password').addEventListener('input', function() {
        const password = this.value;
        const strengthIndicator = document.getElementById('password-strength');
        
        if (!strengthIndicator) return;
        
        let strength = 'Zayıf';
        let color = 'text-danger';
        let icon = 'fas fa-times-circle';
        
        if (password.length >= 8) {
            strength = 'Orta';
            color = 'text-warning';
            icon = 'fas fa-exclamation-circle';
        }
        if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
            strength = 'Güçlü';
            color = 'text-success';
            icon = 'fas fa-check-circle';
        }
        
        strengthIndicator.innerHTML = `<i class="${icon} me-1"></i> Şifre gücü: <span class="${color} fw-bold">${strength}</span>`;
    });


    document.getElementById('tax-number').addEventListener('input', function() {
        const value = this.value.replace(/\D/g, '');
        this.value = value;
        
        if (value.length === 11) {
 
            const isValid = /^[1-9][0-9]{10}$/.test(value);
            if (!isValid) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        } else if (value.length === 10) {

            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });

    const inputs = document.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });

    function updateProgressSteps() {
        const steps = document.querySelectorAll('.progress-step');
        const sections = document.querySelectorAll('.form-section');
        
        let activeStep = 0;
        sections.forEach((section, index) => {
            const inputs = section.querySelectorAll('input, textarea');
            let allFilled = true;
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && input.value.trim() === '') {
                    allFilled = false;
                }
            });
            
            if (allFilled && index > activeStep) {
                activeStep = index;
            }
        });
        
        steps.forEach((step, index) => {
            step.classList.remove('step-active', 'step-complete');
            if (index <= activeStep) {
                step.classList.add('step-complete');
            }
            if (index === activeStep) {
                step.classList.add('step-active');
            }
        });
    }


    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updateProgressSteps);
        input.addEventListener('change', updateProgressSteps);
    });


    updateProgressSteps();
});