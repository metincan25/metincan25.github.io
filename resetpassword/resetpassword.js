document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageArea = document.getElementById('message-area');
    
    // URL'den token'ı alıyoruz
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        messageArea.textContent = "Geçersiz veya eksik sıfırlama linki.";
        messageArea.style.color = 'red';
        form.style.display = 'none'; // Formu gizle
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            messageArea.textContent = "Girdiğiniz şifreler eşleşmiyor.";
            messageArea.style.color = 'orange';
            return;
        }

        try {
            const response = await fetch('https://localhost:7038/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, newPassword: newPasswordInput.value })
            });
            const result = await response.json();

            if (response.ok) {
                messageArea.textContent = result.message + " Giriş sayfasına yönlendiriliyorsunuz...";
                messageArea.style.color = 'green';
                setTimeout(() => { window.location.href = 'invlogin.html'; }, 3000);
            } else {
                messageArea.textContent = result.message;
                messageArea.style.color = 'red';
            }
        } catch (error) {
            messageArea.textContent = "Bir hata oluştu.";
            messageArea.style.color = 'red';
        }
    });
});