document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const messageArea = document.getElementById('message-area');
    const sendButton = document.getElementById('send-reset-link-button');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        sendButton.disabled = true;
        sendButton.textContent = 'Gönderiliyor...';
        messageArea.textContent = '';

        try {
            const response = await fetch('https://localhost:7038/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value })
            });

            // Güvenlik için, e-posta bulunsa da bulunmasa da aynı mesajı gösteririz.
            messageArea.textContent = 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.';
            messageArea.style.color = 'green';
            emailInput.value = '';

        } catch (error) {
            messageArea.textContent = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
            messageArea.style.color = 'red';
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = 'Sıfırlama Linki Gönder';
        }
    });
});