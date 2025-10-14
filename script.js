// Inventra - Modern Mini ERP Çözümü
// JavaScript Dosyası

document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll efekti
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll animasyonları
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-item, .module-card, .tech-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // İlk yüklemede opacity ve transform değerlerini ayarla
    document.querySelectorAll('.feature-item, .module-card, .tech-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    // İlk yüklemede de kontrol et
    animateOnScroll();

    // Aktif menü öğesi takibi
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Floating cards için özel animasyon
    const floatingCards = document.querySelectorAll('.floating-card');
    
    floatingCards.forEach((card, index) => {
        // Her kart için farklı animasyon gecikmesi
        card.style.animationDelay = `${index * 1.5}s`;
        
        // Hover efekti
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.zIndex = '3';
        });
    });

    // Modal fonksiyonları
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Demo butonları için event listener'lar
    document.querySelectorAll('.btn-demo, .btn-primary, .btn-light').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Burada gerçek uygulamada modal açılır veya form sayfasına yönlendirilir
            openModal('demoModal');
        });
    });

    // Modal kapatma işlevi
    document.querySelectorAll('.modal .close, .modal').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('close')) {
                closeModal('demoModal');
            }
        });
    });

    // Sayfa yükleme animasyonu
    const loadingAnimation = function() {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <img src="177f25bb007dc020f07d33cefb4a63ad.png" alt="Inventra" class="logo">
                <p id="tanitim">Demo Versiyonu Yayında!!</p>
                <div class="loader-bar">
                    <div class="loader-progress"></div>
                </div>
            </div>
        `;
        
        // Loader stilini dinamik olarak ekle
        const loaderStyle = document.createElement('style');
        loaderStyle.textContent = `
            .page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #4361ee, #7209b7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 0.5s ease;
            }
            .loader-content {
                text-align: center;
                color: white;
            }
            .loader-content i {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: pulse 2s infinite;
            }
            .loader-content h3 {
                font-size: 2rem;
                margin-bottom: 2rem;
                font-weight: 700;
            }
            .loader-bar {
                width: 200px;
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
                overflow: hidden;
            }
            .loader-progress {
                height: 100%;
                background: white;
                width: 0%;
                animation: loading 2s ease-in-out forwards;
            }
            #tanitim{
               height: 40px;
            }
            @keyframes loading {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(loaderStyle);
        document.body.appendChild(loader);
        
        // Loader'ı kaldır
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(loader);
            }, 500);
        }, 2000);
    };

    // Sayfa yüklendiğinde loading animasyonunu çalıştır
    loadingAnimation();

    // Gerçek zamanlı saat gösterimi
    function updateClock() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const dateTimeString = now.toLocaleDateString('tr-TR', options);
        
        // Saati gösteren bir element yoksa oluştur
        let clockElement = document.getElementById('live-clock');
        if (!clockElement) {
            clockElement = document.createElement('div');
            clockElement.id = 'live-clock';
            clockElement.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--primary);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 0.9rem;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(clockElement);
        }
        
        clockElement.textContent = dateTimeString;
    }

    // Saati güncelle ve her saniye yenile
    updateClock();
    setInterval(updateClock, 1000);

    // Parallax efekti
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // İnteraktif özellik kartları
    const featureCards = document.querySelectorAll('.feature-item');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            icon.style.transform = 'rotate(360deg) scale(1.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            icon.style.transform = 'rotate(0deg) scale(1)';
        });
    });

    // Form doğrulama (demo formu için)
    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            
            if (name && email && company) {
                // Form gönderim animasyonu
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
                submitBtn.disabled = true;
                
                // Simüle edilmiş API çağrısı
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Gönderildi!';
                    submitBtn.style.backgroundColor = '#28a745';
                    
                    setTimeout(() => {
                        closeModal('demoModal');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.backgroundColor = '';
                        demoForm.reset();
                        
                        // Başarı mesajı göster
                        showNotification('Demo talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.', 'success');
                    }, 1500);
                }, 2000);
            } else {
                showNotification('Lütfen tüm alanları doldurun.', 'error');
            }
        });
    }

    // Bildirim sistemi
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Notification stilini dinamik olarak ekle
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-left: 4px solid var(--primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-radius: 4px;
                    padding: 15px;
                    max-width: 400px;
                    z-index: 9999;
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                }
                .notification.success {
                    border-left-color: #28a745;
                }
                .notification.error {
                    border-left-color: #dc3545;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-content i {
                    font-size: 1.2rem;
                }
                .notification.success i {
                    color: #28a745;
                }
                .notification.error i {
                    color: #dc3545;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Bildirimi göster
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Kapatma butonu
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Otomatik kapanma
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Sayfa performansı için lazy loading
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Klavye kısayolları
    document.addEventListener('keydown', function(e) {
        // ESC tuşu ile modal'ı kapat
        if (e.key === 'Escape') {
            closeModal('demoModal');
        }
        
        // H tuşu ile ana sayfaya git
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            document.querySelector('#anasayfa').scrollIntoView({
                behavior: 'smooth'
            });
        }
    });

    // Sayfa görünürlüğü değişikliği
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            document.title = "Denemeden Geçme! | Inventra";
        } else {
            document.title = "Inventra - Modern Mini ERP Çözümü";
        }
    });

    // Responsive menü toggle animasyonu
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('active');
            navbarCollapse.classList.toggle('show');
        });
    }

    console.log('Inventra web sitesi başarıyla yüklendi!');
});

// Sayfa dışından çağrılabilen fonksiyonlar
function showDemoModal() {
    const modalHTML = `
        <div id="demoModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Demo Talep Formu</h3>
                <form id="demoForm">
                    <div class="form-group">
                        <label for="name">Ad Soyad</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">E-posta</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="company">Şirket</label>
                        <input type="text" id="company" name="company" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Mesaj (Opsiyonel)</label>
                        <textarea id="message" name="message" rows="4"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Demo Talep Et</button>
                </form>
            </div>
        </div>
    `;
    
    // Modal stilini ekle
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 9999;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                background-color: white;
                margin: 5% auto;
                padding: 2rem;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                position: relative;
                animation: modalSlideIn 0.3s ease;
            }
            @keyframes modalSlideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .close {
                position: absolute;
                right: 1rem;
                top: 1rem;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--gray);
            }
            .close:hover {
                color: var(--dark);
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 1rem;
            }
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Modal'ı ekle
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Modal event listener'larını ekle
    document.getElementById('demoModal').addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('close')) {
            this.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Sayfa yükleme tamamlandığında çalışacak fonksiyon
window.onload = function() {
    // Performans metrikleri (sadece geliştirme için)
    if (window.performance) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Sayfa yükleme süresi: ${loadTime} ms`);
    }
};