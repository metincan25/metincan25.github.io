document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('register-form');
    const formWrapper = document.getElementById('form-wrapper');
    const API_BASE_URL = 'https://localhost:7038';

    // 1. URL'den token'ı al
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        formWrapper.innerHTML = `<div class="alert alert-danger">Geçersiz kayıt linki.</div>`;
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        submitButton.disabled = true;

       const formData = {
            token: token,
            username: document.getElementById('username').value,
            password: password,
            companyName: document.getElementById('company-name').value,
            taxOffice: document.getElementById('tax-office').value,
            taxNumber: document.getElementById('tax-number').value,
            address: document.getElementById('address').value
        };


        try {
            const response = await fetch(`${API_BASE_URL}/api/registration/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            formWrapper.innerHTML = `
                <div class="card shadow-lg text-center p-5">
                    <h4>${result.message}</h4>
                    <a href="invlogin.html">Giriş Yap</a>
                </div>`;
        } catch (error) {
            alert(`Hata: ${error.message}`);
            submitButton.disabled = false;
        }
    });
});