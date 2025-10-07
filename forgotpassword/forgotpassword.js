document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://localhost:7038';
    
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const messageArea = document.getElementById('message-area');
    const sendButton = document.getElementById('send-reset-link-button');
    const progressSteps = document.querySelectorAll('.step');

  
    emailInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        
  
        if (!email) {
            showMessage('Lütfen e-posta adresinizi girin.', 'error');
            emailInput.classList.add('is-invalid');
            emailInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Lütfen geçerli bir e-posta adresi girin.', 'error');
            emailInput.classList.add('is-invalid');
            emailInput.focus();
            return;
        }

       
        setLoadingState(true);
        showMessage('', ''); 

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
       
                showMessage(
                    'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir. Lütfen e-posta kutunuzu kontrol edin.',
                    'success'
                );
                
               
                updateProgressSteps(2);
            
                emailInput.value = '';
                emailInput.classList.remove('is-valid');
                
                
                messageArea.classList.add('animate__animated', 'animate__bounceIn');
                
            } else {
                
                const errorMessage = data.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
                showMessage(errorMessage, 'error');
                emailInput.classList.add('is-invalid');
            }

        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            showMessage(
                'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
                'error'
            );
            emailInput.classList.add('is-invalid');
        } finally {
            setLoadingState(false);
        }
    });

   
    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = 'message-area'; 
        
        if (type) {
            messageArea.classList.add(type);
            messageArea.style.display = 'block';
            
           
            setTimeout(() => {
                messageArea.classList.remove('animate__animated', 'animate__bounceIn');
            }, 1000);
            
            
            if (type === 'success') {
                setTimeout(() => {
                    if (messageArea.classList.contains('success')) {
                        messageArea.style.display = 'none';
                    }
                }, 8000);
            }
        } else {
            messageArea.style.display = 'none';
        }
    }

 
    function setLoadingState(loading) {
        if (loading) {
            sendButton.classList.add('loading');
            sendButton.disabled = true;
            emailInput.disabled = true;
        } else {
            sendButton.classList.remove('loading');
            sendButton.disabled = false;
            emailInput.disabled = false;
        }
    }

    
    function updateProgressSteps(activeStep) {
        progressSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index < activeStep) {
                step.classList.add('active');
            }
        });
    }

   
    emailInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

 
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            this.classList.add('is-invalid');
            showMessage('Lütfen geçerli bir e-posta adresi girin.', 'error');
        }
    });

    emailInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        showMessage('', ''); 
    });

    emailInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });

  
    sendButton.addEventListener('mouseenter', function() {
        if (!this.classList.contains('loading')) {
            this.style.transform = 'translateY(-2px)';
        }
    });

    sendButton.addEventListener('mouseleave', function() {
        if (!this.classList.contains('loading')) {
            this.style.transform = 'translateY(0)';
        }
    });

    updateProgressSteps(1);
});