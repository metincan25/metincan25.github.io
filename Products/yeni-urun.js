// Products/yeni-urun.js

(function() {
    const form = document.getElementById('add-product-form');
    if (!form) {
        console.error("HATA: 'add-product-form' ID'li form HTML'de bulunamadı!");
        return;
    }

    const saveButton = document.getElementById('save-button');
    const messageArea = document.getElementById('form-message-area');
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.parent.location.href = 'invlogin.html';
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Kaydediliyor...';
        messageArea.innerHTML = '';

        // Formdaki tüm alanlardan verileri oku
        const newProductData = {
            name: document.getElementById('product-name').value,
            sku: document.getElementById('product-sku').value,
            barcode: document.getElementById('product-barcode').value,
            description: document.getElementById('product-description').value,
            salePrice: parseFloat(document.getElementById('product-sale-price').value) || 0,
            purchasePrice: parseFloat(document.getElementById('product-purchase-price').value) || 0,
            vatRate: parseInt(document.getElementById('product-vat').value) || 0,
            stockQuantity: parseInt(document.getElementById('product-stock').value) || 0,
            criticalStockLevel: parseInt(document.getElementById('product-critical-stock').value) || 0,
            unitName: document.getElementById('product-unit').value,
            agirlik: parseFloat(document.getElementById('product-weight').value) || null,
            boyut: document.getElementById('product-dimensions').value,
            kategori: document.getElementById('product-category').value,
            renk: document.getElementById('product-color').value,
            malzeme: document.getElementById('product-material').value,
            mensei: document.getElementById('product-origin').value,
            garantiSuresiAy: parseInt(document.getElementById('product-warranty').value) || null,
            uretimTarihi: document.getElementById('product-prod-date').value || null,
            ekNotlar: document.getElementById('product-notes').value
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newProductData)
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                // Backend'den gelen validasyon veya çakışma hatalarını yakala
                let errorMessage = responseData.message || (responseData.errors ? JSON.stringify(responseData.errors) : `Sunucu hatası: ${response.status}`);
                if (responseData.Sku) errorMessage = responseData.Sku[0]; // SKU çakışması için özel hata
                throw new Error(errorMessage);
            }
            
            messageArea.innerHTML = `<div class="alert alert-success p-2">Ürün (<b>${responseData.name}</b>) başarıyla eklendi.</div>`;
            form.reset();

        } catch (error) {
            messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save me-1"></i>Kaydet';
        }
    });
})();