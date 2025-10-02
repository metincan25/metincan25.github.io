document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const messageArea = document.getElementById('message-area');
    const sendButton = document.getElementById('send-reset-link-button');
    const progressSteps = document.querySelectorAll('.step');

    // Input validation styling
    emailInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });

    // Email format validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Validation
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

        // Show loading state
        setLoadingState(true);
        showMessage('', ''); // Clear previous messages

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
                // Success
                showMessage(
                    'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir. Lütfen e-posta kutunuzu kontrol edin.',
                    'success'
                );
                
                // Update progress steps
                updateProgressSteps(2);
                
                // Clear form
                emailInput.value = '';
                emailInput.classList.remove('is-valid');
                
                // Add success animation
                messageArea.classList.add('animate__animated', 'animate__bounceIn');
                
            } else {
                // API error
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

    // Show message function
    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = 'message-area'; // Reset classes
        
        if (type) {
            messageArea.classList.add(type);
            messageArea.style.display = 'block';
            
            // Remove animation classes after animation completes
            setTimeout(() => {
                messageArea.classList.remove('animate__animated', 'animate__bounceIn');
            }, 1000);
            
            // Auto-hide success messages after 8 seconds
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

    // Loading state management
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

    // Update progress steps
    function updateProgressSteps(activeStep) {
        progressSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index < activeStep) {
                step.classList.add('active');
            }
        });
    }

    // Input enter key support
    emailInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Real-time email validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            this.classList.add('is-invalid');
            showMessage('Lütfen geçerli bir e-posta adresi girin.', 'error');
        }
    });

    // Add input animation on focus
    emailInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        showMessage('', ''); // Clear messages when user starts typing
    });

    emailInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });

    // Add some interactive effects
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

    // Initialize progress steps
    updateProgressSteps(1);
});