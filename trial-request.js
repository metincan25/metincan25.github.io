document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('trial-request-form');
    const formWrapper = document.getElementById('form-wrapper');
    const API_BASE_URL = 'https://localhost:7038'; // Kendi API adresinizi doğrulayın

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Gönderiliyor...`;

        // Checkbox'lardan seçilenleri al
        const requestedModules = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            requestedModules.push(checkbox.value);
        });

        const formData = {
            nameOrCompany: document.getElementById('name').value,
            email: document.getElementById('email').value,
            customerType: document.getElementById('customer-type').value,
            industry: document.getElementById('industry').value,
            requestedModules: requestedModules
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/inquiry/submit-trial-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Bir hata oluştu.');
            }
            
            // Başarılı olursa formu gizle ve teşekkür mesajı göster
            formWrapper.innerHTML = `
                <div class="card shadow-sm text-center p-5">
                    <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                    <h4>Teşekkürler!</h4>
                    <p class="text-muted">${result.message}</p>
                    <a href="invlogin.html">Giriş Sayfasına Dön</a>
                </div>`;

        } catch (error) {
            alert(`Hata: ${error.message}`);
            submitButton.disabled = false;
            submitButton.textContent = 'Demo Talebini Gönder';
        }
    });
});