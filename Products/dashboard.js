document.addEventListener("DOMContentLoaded", function() {
    const API_BASE_URL = 'https://localhost:7038';

    let successModalInstance = null;
    const successModalElement = document.getElementById('successModal');
    if (successModalElement) {
        successModalInstance = new bootstrap.Modal(successModalElement);
    }

    window.showSuccessModal = function(message) {
        if (successModalInstance) {
            const modalBody = document.getElementById('successModalBody');
            if (modalBody) {
                modalBody.textContent = message;
            }
            successModalInstance.show();
        }
    }


   function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function applyRoleBasedUI() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const decodedToken = parseJwt(token);
    if (!decodedToken) return;
    
    const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                    decodedToken.role; 
    const username = decodedToken.unique_name || 
                    decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']; 

    if (userRole !== 'Admin') {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
    }
    
    const navbarUsername = document.getElementById('navbar-username');
    if (navbarUsername && username) {
        navbarUsername.textContent = username;
    }
    
    const profileUsername = document.querySelector('.sidebar-user .user-name');
    if(profileUsername && username) {
        profileUsername.textContent = username;
    }
}

// Arayüzü güncelleyen fonksiyon
function updateUserInfo() {
    const token = localStorage.getItem('authToken');
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken) {
            const username = decodedToken.unique_name || 
                           decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                           'Kullanıcı'; 

            const nameParts = username.split(' ');
            const initials = nameParts.length > 1 
                ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                : username.substring(0, 2);


            const userNameElement = document.querySelector('.sidebar-user .user-name');
            const userAvatarElement = document.querySelector('.sidebar-user .user-avatar');

            if (userNameElement) userNameElement.textContent = username;
            if (userAvatarElement) userAvatarElement.textContent = initials.toUpperCase();
        }
    }
}



   const summaryTabButton = document.querySelector(".nav-link[data-page='dashboard-summary']");
    if(summaryTabButton){
        summaryTabButton.addEventListener('click', function(e){
            e.preventDefault();
            const tab = new bootstrap.Tab(this);
            tab.show();
        });
    }
    


   window.initializeDashboardPage = initializeDashboardPage;
   window.initializeProductList = initializeProductList;



   
   
    updateUserInfo();
   

      
      const menuToggle = document.getElementById("menu-toggle");
      const wrapper = document.getElementById("wrapper");
      const tabNavigation = document.getElementById("tab-navigation");
      const tabContent = document.getElementById("tab-content");
      const deleteModalElement = document.getElementById('deleteConfirmationModal');
      const deleteModal = deleteModalElement ? new bootstrap.Modal(deleteModalElement) : null;
      const deleteModalBody = document.getElementById('deleteModalBodyText');
      const confirmDeleteButton = document.getElementById('confirmDeleteButton');
      const shipmentModalElement = document.getElementById('shipmentConfirmationModal');
      const shipmentModal = new bootstrap.Modal(shipmentModalElement);
      const confirmShipmentButton = document.getElementById('confirmShipmentButton');
      const shipmentModalBodyText = document.getElementById('shipmentModalBodyText');
      const invoiceModalElement = document.getElementById('invoiceConfirmationModal');
      const invoiceModal = new bootstrap.Modal(invoiceModalElement);
      const confirmInvoiceButton = document.getElementById('confirmInvoiceButton');
      const invoiceModalBodyText = document.getElementById('invoiceModalBodyText');
      const purchaseInvoiceModalElement = document.getElementById('purchaseInvoiceConfirmationModal');
      const purchaseInvoiceModal = new bootstrap.Modal(purchaseInvoiceModalElement);
      const confirmPurchaseInvoiceButton = document.getElementById('confirmPurchaseInvoiceButton');
      const purchaseInvoiceModalBodyText = document.getElementById('purchaseInvoiceModalBodyText');
      const logoutButton = document.getElementById('logout-button');
      const printButton = document.getElementById('printDocumentButton');
      const docModalContent = document.getElementById('documentModalContent');


     let waybillToInvoiceNumber = null;
     let waybillToInvoiceId = null;
     let itemToDeleteId = null;
     let itemToDeleteName = null; 
     let afterDeleteCallback = null;
     let deleteEndpoint = '';
     let orderToShipId = null;
     let orderToShipNumber = null;

      if (printButton && docModalContent) {
        printButton.addEventListener('click', function() {
            docModalContent.classList.add('printable-area');
            
            window.print();
            
           
            docModalContent.classList.remove('printable-area');
        });
    }
     
     
     

    if (!menuToggle || !wrapper || !tabNavigation || !tabContent) {
        console.error("Ana sayfa iskelet elemanları bulunamadı!"); return;
    }
    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }
     if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault(); 

            if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
                localStorage.removeItem('authToken');
                window.location.href = 'invlogin.html';
            }
        });
    }
    menuToggle.addEventListener("click", () => wrapper.classList.toggle("toggled"));
     
    confirmDeleteButton.addEventListener('click', async () => {
        
        if (!itemToDeleteId || !deleteEndpoint) {
            console.error("Silinecek öğe ID'si veya silme URL'i ayarlanmamış!");
            return;
        }
       
        if (!itemToDeleteId) return;

        const token = localStorage.getItem('authToken');
        if (!token) { window.location.href = 'invlogin.html'; return; }

        const originalButtonText = "Evet, Sil";
        confirmDeleteButton.disabled = true;
        confirmDeleteButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Siliniyor...`;
        deleteModalBody.style.color = 'inherit';
        deleteModalBody.textContent = ''; 
        try {
            let fullDeleteUrl;
            if(deleteEndpoint.includes(itemToDeleteId)){
                fullDeleteUrl = `${API_BASE_URL}${deleteEndpoint}`;
            }
            else{
                fullDeleteUrl = `${API_BASE_URL}${deleteEndpoint}/${itemToDeleteId}`;

            }
            
            const response = await fetch(fullDeleteUrl, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Silme işlemi sırasında bir sunucu hatası oluştu." }));
                throw new Error(errorData.message);
            }
            
            deleteModal.hide();
            showSuccessModal(`'${itemToDeleteName}' başarıyla silindi.`);
            

            if (typeof afterDeleteCallback === 'function') {
             afterDeleteCallback();
            }

        } catch (error) {
            deleteModalBody.textContent = error.message;
            deleteModalBody.style.color = 'red';
        } finally {
            itemToDeleteId = null;
            afterDeleteCallback = null;
            deleteUrl = '';
            confirmDeleteButton.disabled = false;
            confirmDeleteButton.innerHTML = originalButtonText;
        }

    });
    confirmShipmentButton.addEventListener('click', async () => {
    if (!orderToShipId) return;

     const token = localStorage.getItem('authToken');
     const originalButtonText = "Evet, Sevk Et";
     confirmShipmentButton.disabled = true;
     confirmShipmentButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> İşleniyor...`;

     try {
        const response = await fetch(`${API_BASE_URL}/api/shipments/create-waybill/${orderToShipId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Sevk işlemi başarısız.');
        
        shipmentModal.hide(); 
        
        window.showSuccessModal(`'${orderToShipNumber}' siparişi için '${result.waybillNumber}' numaralı irsaliye oluşturuldu.`);

        const shipmentsTabLink = document.querySelector(`[data-page="Orders/sevk-edilecekler.html"]`);
        if (shipmentsTabLink) {
            shipmentsTabLink.click();
        }

    } catch (error) {
        shipmentModalBodyText.innerHTML = `<div class="alert alert-danger p-2 m-0">${error.message}</div>`;
    } finally {
        orderToShipId = null;
        orderToShipNumber = null;
        confirmShipmentButton.disabled = false;
        confirmShipmentButton.innerHTML = originalButtonText;
    }
  });
   confirmPurchaseInvoiceButton.addEventListener('click', async () => {
    if (!waybillToInvoiceId) return;

    const token = localStorage.getItem('authToken');
    const originalButtonText = "Evet, Faturalaştır";
    confirmPurchaseInvoiceButton.disabled = true;
    confirmPurchaseInvoiceButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> İşleniyor...`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/purchaseinvoices/create-from-waybill/${waybillToInvoiceId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Fatura oluşturulamadı.');
        
        purchaseInvoiceModal.hide(); 
        
        window.showSuccessModal(`İrsaliye başarıyla faturalaştırıldı. Yeni Alış Faturası No: ${result.invoiceNumber}`);

        const invoicesTabLink = document.querySelector(`[data-page="Siparisler/alis-faturalari.html"]`);
        if (invoicesTabLink) {
            invoicesTabLink.click();
        }

    } catch (error) {
        purchaseInvoiceModalBodyText.innerHTML = `<div class="alert alert-danger p-2 m-0">${error.message}</div>`;
    } finally {
        waybillToInvoiceId = null;
        waybillToInvoiceNumber = null;
        confirmPurchaseInvoiceButton.disabled = false;
        confirmPurchaseInvoiceButton.innerHTML = originalButtonText;
    }
});

function renderDocumentTemplate(data) {
       const docModalContent = document.getElementById('documentModalContent');
    if (!data || !data.items || !data.senderInfo || !data.receiverInfo) {
        docModalContent.innerHTML = `<div class="alert alert-danger m-3">Görüntülenecek belge verisi eksik veya hatalı.</div>`;
        return;
    }


    const isWaybill = (data.documentType || '').toLowerCase().includes('irsaliye');

    const headerHtml = isWaybill ?
        `<tr class="heading">
            <td>Ürün Kodu</td>
            <td>Ürün Adı</td>
            <td class="text-center">Miktar</td>
        </tr>` :
        `<tr class="heading">
            <td>Ürün Kodu</td>
            <td>Ürün Adı</td>
            <td class="text-center">Miktar</td>
            <td class="text-end">Birim Fiyat</td>
            <td class="text-end">Toplam</td>
        </tr>`;

    const itemsHtml = data.items.map(item => {
        if (isWaybill) {
            return `<tr class="item">
                        <td>${item.sku || ''}</td>
                        <td>${item.productName || ''}</td>
                        <td class="text-center">${item.quantity}</td>
                    </tr>`;
        } else {
            return `<tr class="item">
                        <td>${item.sku || ''}</td>
                        <td>${item.productName || ''}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-end">${(item.unitPrice || 0).toFixed(2)} ₺</td>
                        <td class="text-end fw-bold">${(item.totalPrice || 0).toFixed(2)} ₺</td>
                    </tr>`;
        }
    }).join('');

    const footerHtml = isWaybill ? '' :
        `<tr class="total">
            <td colspan="3"></td>
            <td class="text-end fw-bold">GENEL TOPLAM:</td>
            <td class="text-end fw-bold">${(data.totalAmount || 0).toFixed(2)} ₺</td>
        </tr>`;

    const documentType = data.documentType ? data.documentType.toUpperCase() : 'BELGE DETAYI';

    const template = `
        <style>
            .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 14px; line-height: 22px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 35px; line-height: 35px; color: #333; }
            .invoice-box table tr.information td { border-top: 1px solid #eee; padding-top: 20px; }
            .invoice-box .address-block { margin-bottom: 20px; }
            .invoice-box .address-block strong.company-name { font-size: 16px; color: #333; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.total td { border-top: 2px solid #eee; font-weight: bold; }
            .text-end { text-align: right !important; } 
            .text-center { text-align: center !important; } 
            .fw-bold { font-weight: bold; }
        </style>
        <div class="invoice-box">
            <table>
                <tr class="top">
                    <td colspan="5">
                        <table>
                            <tr>
                                <td class="title"><img src="177f25bb007dc020f07d33cefb4a63ad.png" style="width:100%; max-width:150px;"></td>
                                <td class="text-end">
                                    <strong>${documentType}</strong><br>
                                    <strong>No:</strong> ${data.documentNumber || 'N/A'}<br>
                                    <strong>Tarih:</strong> ${new Date(data.documentDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="5">
                        <div class="address-block">
                            <strong>GÖNDEREN:</strong><br>
                            <strong class="company-name">${data.senderInfo.name || ''}</strong><br>
                            ${data.senderInfo.address || ''}<br>
                            ${data.senderInfo.taxInfo || ''}
                        </div>
                        <div class="address-block">
                            <strong>ALICI:</strong><br>
                            <strong class="company-name">${data.receiverInfo.name || ''}</strong><br>
                            ${data.receiverInfo.address || ''}<br>
                            ${data.receiverInfo.taxInfo || ''}
                        </div>
                    </td>
                </tr>
                
                ${headerHtml}
                ${itemsHtml}
                ${footerHtml}

            </table>
        </div>
    `;
    
    docModalContent.innerHTML = template;

}


    


    function initializeNewProductForm(container) {
     const form = container.querySelector('#add-product-form');
     if (!form) { console.error("Yeni ürün formu bulunamadı!"); return; }

     const saveButton = container.querySelector('#save-button');
     const messageArea = container.querySelector('#form-message-area');
     const token = localStorage.getItem('authToken');
     const categorySelect = container.querySelector('#product-category-select');
     const brandSelect = container.querySelector('#product-brand-select');
     const unitSelect = container.querySelector('#product-unit-select');


        async function populateDropdown(selectElement, endpoint, defaultOptionText) {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Veri çekilemedi.');
                const data = await response.json();
                
                selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });
            } catch (error) {
                console.error(`${endpoint} yüklenirken hata:`, error);
                selectElement.innerHTML = `<option value="">Veriler yüklenemedi</option>`;
            }
        }

        populateDropdown(categorySelect, '/api/categories', 'Kategori Seçiniz...');
        populateDropdown(brandSelect, '/api/brands', 'Marka Seçiniz...');
        populateDropdown(unitSelect, '/api/units', 'Birim Seçiniz...');
    
     if (!token) { window.parent.location.href = 'invlogin.html'; return; }

     form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Kaydediliyor...';
        messageArea.innerHTML = '';
        const newProductData = {
           name: container.querySelector('#product-name')?.value,
            sku: container.querySelector('#product-sku')?.value,
            barcode: container.querySelector('#product-barcode')?.value,
            description: container.querySelector('#product-description')?.value,
            
            purchasePrice: parseFloat(container.querySelector('#product-purchase-price')?.value) || 0,
            salePrice: parseFloat(container.querySelector('#product-sale-price')?.value) || 0,
            vatRate: parseInt(container.querySelector('#product-vat')?.value) || 0,
            stockQuantity: parseInt(container.querySelector('#product-stock')?.value) || 0,
            criticalStockLevel: parseInt(container.querySelector('#product-critical-stock')?.value) || 0,
            unitId: parseInt(unitSelect.value) || null,
            categoryId: parseInt(categorySelect.value) || null,
            brandId: parseInt(brandSelect.value) || null,
            agirlik: parseFloat(container.querySelector('#product-weight')?.value) || null,
            boyut: container.querySelector('#product-dimensions')?.value,
            renk: container.querySelector('#product-color')?.value,
            malzeme: container.querySelector('#product-material')?.value,
            mensei: container.querySelector('#product-origin')?.value,
            garantiSuresiAy: parseInt(container.querySelector('#product-warranty')?.value) || null,
            uretimTarihi: container.querySelector('#product-prod-date')?.value || null,
            teknikOzellikler: container.querySelector('#product-specs')?.value,
            ekNotlar: container.querySelector('#product-notes')?.value
        };

        try {
          
            const apiUrl = `${API_BASE_URL}/api/products`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newProductData)
            });

            const responseData = await response.json();
            if (!response.ok) {
                let errorMessage = responseData.message || `Sunucu hatası: ${response.status}`;
                if (responseData.errors?.Sku) errorMessage = responseData.errors.Sku[0]; 
                throw new Error(errorMessage);
            }

            window.showSuccessModal(`"${responseData.name}" adlı ürün başarıyla eklendi.`);
            form.reset();

        } catch (error) {
            messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save me-1"></i>Kaydet';
        }
    });
 }
   
    function initializeProductList(container) {
        const token = localStorage.getItem('authToken');
        if (!token) { window.location.href = 'invlogin.html'; return; }
        const tableBody = container.querySelector('#product-table-body');
        const totalRecordsInfo = container.querySelector('#total-records-info');
        const filterInputs = container.querySelectorAll('.datagrid-filter-row input');
        const addNewProductButton = container.querySelector('#open-add-new-product-tab');
        const paginationContainer = container.querySelector('#pagination-container');
        if (!tableBody || !totalRecordsInfo || !filterInputs || !addNewProductButton || !paginationContainer) {
            console.error('urun-listesi.html içindeki elemanlardan biri veya birkaçı bulunamadı.'); return;
        }
        let filters = { page: 1, pageSize: 15 };
        let debounceTimer;

        async function fetchAndRenderProducts() {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
            const queryParams = new URLSearchParams(filters);
            const apiUrl = `${API_BASE_URL}/api/products?${queryParams.toString()}`;
            try {
                const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.status === 401) { localStorage.removeItem('authToken'); alert("Oturumunuz geçersiz. Lütfen tekrar giriş yapın."); window.location.href = 'invlogin.html'; return; }
                if (!response.ok) throw new Error('Sunucu hatası!');
                const result = await response.json();
                renderTable(result.items); renderPagination(result);
                totalRecordsInfo.textContent = `Toplam ${result.totalCount} kayıt`;
            } catch (error) {
                console.error('Fetch error:', error);
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger p-4">Ürünler yüklenirken bir hata oluştu.</td></tr>`;
            }
        }
        function renderTable(products) {
            if (!products || products.length === 0) { tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Sonuç bulunamadı.</td></tr>`; return; }
        tableBody.innerHTML = products.map(p => `
            <tr>
                <td><strong>${p.sku || ''}</strong></td>
                <td>${p.name || ''}</td>
                <td class="text-center">${p.stockQuantity}</td>
                <td>${p.unitName || ''}</td>
                <td class="text-end fw-bold">${(p.salePrice || 0).toFixed(2)} ₺</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-product-btn" data-id="${p.id}" data-name="${p.name}" title="Düzenle"><i class="fas fa-edit fa-fw"></i></button>
                    <button class="btn btn-sm btn-outline-danger ms-1 delete-product-btn" data-id="${p.id}" data-name="${p.name}" title="Sil"><i class="fas fa-trash fa-fw"></i></button>
                </td>
            </tr>`).join('');
        }
        function renderPagination(result) {
            paginationContainer.innerHTML = ''; if (result.totalPages <= 1) return;
            const createPageItem = (page, text, isDisabled = false, isActive = false) => {
                const li = document.createElement('li'); li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" href="#" data-page="${page}">${text}</a>`; return li;
            };
            paginationContainer.appendChild(createPageItem(result.currentPage - 1, '«', result.currentPage === 1));
            paginationContainer.appendChild(createPageItem(result.currentPage + 1, '»', result.currentPage === result.totalPages));
        }
        filterInputs.forEach(input => {
        input.addEventListener('keyup', (event) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const key = event.target.getAttribute('data-filter-key');
                const value = event.target.value;

                if (value) {
                    filters[key] = value;
                } else {
                    delete filters[key];
                }

                filters.page = 1;
                fetchAndRenderProducts();
            }, 500);
        });
    });
        tableBody.addEventListener('click', (e) => {
          const editButton = e.target.closest('.edit-product-btn');
          const deleteButton = e.target.closest('.delete-product-btn');
            if(editButton) {
               const productId = editButton.dataset.id;
               const productName = editButton.dataset.name; 
               const pageUrl = `Products/urun-islemleri.html?id=${productId}`;
               openTab(pageUrl, `${productName} - Düzenle`);
             }
             if (deleteButton) {
                itemToDeleteId = deleteButton.dataset.id;
                itemToDeleteName = deleteButton.dataset.name;
                afterDeleteCallback = fetchAndRenderProducts; 
                deleteEndpoint = '/api/products'; 
                deleteModalBody.textContent = `'${itemToDeleteName}' (${itemToDeleteId} ID'li) ürünü silmek (pasif hale getirmek) istediğinize emin misiniz?`;
                deleteModal.show();
            }
       });
        paginationContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && !e.target.parentElement.classList.contains('disabled')) {
                e.preventDefault();
                fetchAndRenderProducts(parseInt(e.target.dataset.page));
            }
        });
        addNewProductButton.addEventListener('click', () => openTab('Products/yeni-urun.html', 'Yeni Ürün Ekle'));
        fetchAndRenderProducts();
    }



 function initializeProductEditPage(container, pageUrl) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.parent.location.href = 'invlogin.html';
        return;
    }

    const urlParams = new URLSearchParams(pageUrl.split('?')[1]);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = `<div class="alert alert-danger m-4">Geçersiz ürün ID'si.</div>`;
        return;
    }

    const form = container.querySelector('#edit-product-form');
    if (!form) {
        console.error("Düzenleme formu '#edit-product-form' bu sekmede bulunamadı!");
        container.innerHTML = `<div class="alert alert-danger m-4">Sayfa yapısı bozuk. Form bulunamadı.</div>`;
        return;
    }


    const saveButton = container.querySelector('#update-button');
    const messageArea = container.querySelector('#edit-form-message-area');
    const pageTitle = container.querySelector('#edit-page-title');
    
 
    const nameInput = container.querySelector('#edit-product-name');
    const skuInput = container.querySelector('#edit-product-sku');
    const barcodeInput = container.querySelector('#edit-product-barcode');
    const descriptionInput = container.querySelector('#edit-product-description');
    
    const salePriceInput = container.querySelector('#edit-product-sale-price');
    const purchasePriceInput = container.querySelector('#edit-product-purchase-price');
    const vatInput = container.querySelector('#edit-product-vat');
    const stockInput = container.querySelector('#edit-product-stock');
    const criticalStockInput = container.querySelector('#edit-product-critical-stock');
    
    const unitSelect = container.querySelector('#edit-product-unit-select');
    const categorySelect = container.querySelector('#edit-product-category-select');
    const brandSelect = container.querySelector('#edit-product-brand-select');
    const weightInput = container.querySelector('#edit-product-weight');
    const dimensionsInput = container.querySelector('#edit-product-dimensions');

    const colorInput = container.querySelector('#edit-product-color');
    const materialInput = container.querySelector('#edit-product-material');
    const warrantyInput = container.querySelector('#edit-product-warranty');
    const originInput = container.querySelector('#edit-product-origin');
    const prodDateInput = container.querySelector('#edit-product-prod-date');
    const specsInput = container.querySelector('#edit-product-specs');
    const notesInput = container.querySelector('#edit-product-notes');


    async function populateDropdown(selectElement, endpoint, selectedValue) {
        if (!selectElement) return;
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Seçenekler yüklenemedi.');
            const data = await response.json();
            
            selectElement.innerHTML = `<option value="">Seçiniz...</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                if (item.id === selectedValue) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(`${endpoint} yüklenirken hata:`, error);
        }
    }

    async function loadProductDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Ürün detayları yüklenemedi.');
            const product = await response.json();
            
            if(pageTitle) pageTitle.textContent = `'${product.name}' Düzenleniyor`;
            
            nameInput.value = product.name || '';
            skuInput.value = product.sku || '';
            barcodeInput.value = product.barcode || '';
            descriptionInput.value = product.description || '';
            salePriceInput.value = product.salePrice || 0;
            purchasePriceInput.value = product.purchasePrice || 0;
            vatInput.value = product.vatRate || 20;
            stockInput.value = product.stockQuantity || 0;
            criticalStockInput.value = product.criticalStockLevel || 10;
            
            await populateDropdown(unitSelect, '/api/units', product.unitId);
            await populateDropdown(categorySelect, '/api/categories', product.categoryId);
            await populateDropdown(brandSelect, '/api/brands', product.brandId);

            colorInput.value = product.renk || '';
            materialInput.value = product.malzeme || '';
            weightInput.value = product.agirlik || '';
            dimensionsInput.value = product.boyut || '';
            originInput.value = product.mensei || '';
            warrantyInput.value = product.garantiSuresiAy || '';
            notesInput.value = product.ekNotlar || '';
            specsInput.value = product.teknikOzellikler || '';

            if (product.uretimTarihi) {
                prodDateInput.value = new Date(product.uretimTarihi).toISOString().split('T')[0];
            }

        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger m-4">${error.message}</div>`;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Güncelleniyor...`;
        if(messageArea) messageArea.innerHTML = '';

        const updatedProductData = {
            name: nameInput.value,
            sku: skuInput.value,
            barcode: barcodeInput.value,
            description: descriptionInput.value,
            purchasePrice: parseFloat(purchasePriceInput.value),
            salePrice: parseFloat(salePriceInput.value),
            vatRate: parseInt(vatInput.value),
            stockQuantity: parseInt(stockInput.value),
            criticalStockLevel: parseInt(criticalStockInput.value),
            unitId: parseInt(unitSelect.value) || null,
            categoryId: parseInt(categorySelect.value) || null,
            brandId: parseInt(brandSelect.value) || null,
            renk: colorInput.value,
            malzeme: materialInput.value,
            agirlik: parseFloat(weightInput.value) || null,
            boyut: dimensionsInput.value,
            mensei: originInput.value,
            garantiSuresiAy: parseInt(warrantyInput.value) || null,
            uretimTarihi: prodDateInput.value || null,
            teknikOzellikler: specsInput.value,
            ekNotlar: notesInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedProductData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Güncelleme başarısız oldu.');
            }
            
            window.showSuccessModal('Ürün başarıyla güncellendi.');
        } catch (error) {
            if(messageArea) messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-check me-1"></i>Değişiklikleri Kaydet';
        }
    });
    loadProductDetails();
 }


 function initializeDashboardPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const welcomeUsernameEl = container.querySelector('#welcome-username');
    const liveDateEl = container.querySelector('#live-date');
    const liveClockEl = container.querySelector('#live-clock');
    const shortcutCards = container.querySelectorAll('.shortcut-card');

    if (!welcomeUsernameEl || !liveDateEl || !liveClockEl) {
       console.error("Ana Sayfa için gerekli HTML elemanları bulunamadı. Lütfen ID'leri kontrol edin.");
    return;
    }


     const decodedToken = parseJwt(token);
    if (decodedToken) {
      const username = decodedToken.unique_name || 
                    decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                    decodedToken.sub;
    
      if (username) {
        welcomeUsernameEl.textContent = username;
        }
    }
   function updateDateTime() {
        const now = new Date();
        liveDateEl.textContent = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        liveClockEl.textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
     }
   updateDateTime();
   const clockInterval = setInterval(updateDateTime, 1000);

   shortcutCards.forEach(card => {
       card.addEventListener('click', function() {
       const pageUrl = this.dataset.page;
       const pageTitle = this.dataset.title;
       if (pageUrl && pageTitle) {
          window.openTab(pageUrl, pageTitle);
        }
   });
});


}



    function initializeUnitsPage(container) {
        const token = localStorage.getItem('authToken');
        if (!token) { window.location.href = 'invlogin.html'; return; }

        const unitList = container.querySelector('#unit-list');
        const form = container.querySelector('#unit-form');
        const unitNameInput = container.querySelector('#unit-name');
        const unitSymbolInput = container.querySelector('#unit-symbol');
        const unitDescInput = container.querySelector('#unit-description');
        const messageArea = container.querySelector('#form-message-area');
        const addButton = form.querySelector('button[type="submit"]');

        async function fetchAndRenderUnits() {
            unitList.innerHTML = `<div class="text-center p-4"><div class="spinner-border spinner-border-sm"></div></div>`;
            try {
                const response = await fetch(`${API_BASE_URL}/api/units`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Birimler yüklenemedi.');
                const units = await response.json();
                
                if (!units || units.length === 0) {
                    unitList.innerHTML = '<div class="text-muted text-center p-3">Henüz hiç birim eklenmemiş.</div>';
                    return;
                }
                
                unitList.innerHTML = units.map(unit => `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong class="d-block">${unit.name} (${unit.symbol})</strong>
                            <small class="text-muted">${unit.description || ''}</small>
                        </div>
                        <div><button class="btn btn-sm btn-outline-danger delete-unit-btn" data-id="${unit.id}" data-name="${unit.name}"><i class="fas fa-trash fa-fw"></i></button></div>
                    </div>`).join('');

            } catch (error) {
                unitList.innerHTML = `<div class="text-danger text-center p-3">${error.message}</div>`;
            }
        }
        unitList.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-unit-btn');
            if (deleteButton) {
                itemToDeleteId = deleteButton.dataset.id;
                itemToDeleteName = deleteButton.dataset.name;
                afterDeleteCallback = fetchAndRenderUnits;
                deleteEndpoint = '/api/units';
                deleteModalBodyText.textContent = `'${itemToDeleteName}' adlı birimi silmek istediğinize emin misiniz?`;
                deleteModal.show();
            }
        });
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            addButton.disabled = true;
            try {
                const newUnit = { 
                    name: unitNameInput.value, 
                    symbol: unitSymbolInput.value,
                    description: unitDescInput.value 
                };
                const response = await fetch(`${API_BASE_URL}/api/units`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newUnit)
                });
                if (!response.ok) { const error = await response.json(); throw new Error(error.message || 'Birim eklenemedi.'); }
                form.reset();
                await fetchAndRenderUnits();
            } catch (error) {
                if(messageArea) messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
            } finally {
                addButton.disabled = false;
            }
        });

        fetchAndRenderUnits();
    }



function initializeInvoicesPage(container) {
   const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }
    const tableBody = container.querySelector('#invoices-table-body');
    const filterInputs = container.querySelectorAll('.filter-input');
    const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
    const docModalTitle = document.getElementById('documentModalTitle');
    const docModalContent = document.getElementById('documentModalContent');
    const docModalActionButtons = document.getElementById('documentModalActionButtons');

    
   
    let debounceTimer;

  
    async function fetchAndRenderSalesInvoices(search = '') {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        const params = new URLSearchParams();
        filterInputs.forEach(input => {
            if (input.value) {
                params.append(input.dataset.filterkey, input.value);
            }
        });
        const apiUrl = `${API_BASE_URL}/api/salesinvoices?${params.toString()}`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 401) { window.location.href = 'invlogin.html'; return; }
            if (!response.ok) throw new Error('Satış faturaları yüklenemedi.');

            const invoices = await response.json();

            if (!invoices || invoices.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Gösterilecek satış faturası bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = invoices.map(inv => {
                const invoiceDate = new Date(inv.invoiceDate).toLocaleDateString('tr-TR');
                const isPaid = inv.status === 'Ödendi';
                return `
                    <tr class="sales-invoice-row" data-id="${inv.id}" data-status="${inv.status}" style="cursor:pointer;" title="Detayları Gör ve İşlem Yap">
                        <td><strong>${inv.invoiceNumber}</strong></td>
                        <td>${new Date(inv.invoiceDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>${inv.supplierName}</td>
                        <td class="text-end fw-bold">${inv.totalAmount.toFixed(2)} ₺</td>
                        <td class="text-center"><span class="badge ${isPaid ? 'bg-success' : 'bg-warning'}">${inv.status}</span></td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }
    
    filterInputs.forEach(input => {
        if (input.type === 'text') {
            input.addEventListener('keyup', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { fetchAndRenderSalesInvoices(); }, 500);
            });
        } else {
            input.addEventListener('change', fetchAndRenderSalesInvoices);
        }
    });
    tableBody.addEventListener('click', async (e) => {
       const row = e.target.closest('.sales-invoice-row');
        if (row) {
            const invoiceId = row.dataset.id;
            const invoiceStatus = row.dataset.status;

            docModalTitle.textContent = "Fatura Detayı Yükleniyor...";
            docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
            docModalActionButtons.innerHTML = '';

            
            docModal.show();

            try {
                const response = await fetch(`${API_BASE_URL}/api/salesinvoices/${invoiceId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Fatura detayı alınamadı.");
                }
                const data = await response.json();
                
                docModalTitle.textContent = data.documentType;
                renderDocumentTemplate(data);
            } catch(error) {
                docModalContent.innerHTML = `<p class="text-danger p-4">${error.message}</p>`;
            }
        }
    });
    
    fetchAndRenderSalesInvoices();
}




     function initializeCategoriesPage(container) {
        const token = localStorage.getItem('authToken');
        if (!token) { window.location.href = 'invlogin.html'; return; }

        const categoryList = container.querySelector('#category-list');
        const form = container.querySelector('#category-form');
        const categoryNameInput = container.querySelector('#category-name');
        const categoryDescInput = container.querySelector('#category-description');
        const messageArea = container.querySelector('#form-message-area');
        const addButton = form.querySelector('button[type="submit"]');

        async function fetchAndRenderCategories() {
         categoryList.innerHTML = `<div class="text-center p-4"><div class="spinner-border spinner-border-sm"></div></div>`;
         try {
            const response = await fetch(`${API_BASE_URL}/api/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Kategoriler yüklenemedi.');
            
            const categories = await response.json();
            
            if (categories.length === 0) {
                categoryList.innerHTML = '<div class="text-muted text-center p-3">Henüz hiç kategori eklenmemiş.</div>';
                return;
            }
            renderCategoryList(categories, categoryList);

         } catch (error) {
            categoryList.innerHTML = `<div class="text-danger text-center p-3">${error.message}</div>`;
         }
       }
        
    
        function renderCategoryList(categories, listElement) {
            listElement.innerHTML = categories.map(cat => `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="d-block">${cat.name}</strong>
                        <small class="text-muted">${cat.description || ''}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-danger delete-category-btn" 
                                data-id="${cat.id}" 
                                data-name="${cat.name}" 
                                title="Sil">
                            <i class="fas fa-trash fa-fw"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

    
    
        categoryList.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-category-btn');
            if (deleteButton) {
                const id = deleteButton.dataset.id;
                const name = deleteButton.dataset.name;
                itemToDeleteId = deleteButton.dataset.id;
                itemToDeleteName = deleteButton.dataset.name;
                afterDeleteCallback = fetchAndRenderCategories;
                deleteEndpoint = '/api/categories';
                
                deleteModalBody.textContent = `'${name}' adlı kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
                deleteModal.show();
            }
    });

    function initializeProductOperationsPage(container) {
        const token = localStorage.getItem('authToken');
        if (!token) { window.location.href = 'invlogin.html'; return; }
        
        const productListBody = container.querySelector('#operations-product-list-body');

        async function fetchAndRenderProducts() {
            productListBody.innerHTML = `<tr><td colspan="4" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
            try {
                const response = await fetch(`${API_BASE_URL}/api/products`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Ürünler yüklenemedi.');
                const result = await response.json();
                if (!result.items || result.items.length === 0) {
                      productListBody.innerHTML = `<tr><td colspan="4" class="text-center p-3">İşlem yapılacak ürün bulunamadı.</td></tr>`;
                     return;
                }
                productListBody.innerHTML = result.items.map(p => `
                <tr class="product-row" data-id="${p.id}" style="cursor: pointer;" title="Detayları gör/düzenle">
                    <td><strong>${p.sku}</strong></td>
                    <td>${p.name}</td>
                    <td class="text-center">${p.stockQuantity}</td>
                    <td>${p.unitName || ''}</td>
                </tr>`).join('');
            } catch (error) { productListBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center p-3">${error.message}</td></tr>`;}
        }


       
        productListBody.addEventListener('click', async (e) => {
            const row = e.target.closest('.product-row');
            if (!row) return;
            
            activeProductId = row.dataset.id;
            detailModalBodyText.innerHTML = '<div class="spinner-border"></div>';
            detailModal.show();
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/${activeProductId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error("Detaylar alınamadı.");
                const product = await response.json();
                populateDetailModal(product);
            } catch (error) { detailModalBodyText.innerHTML = `<p class="text-danger">${error.message}</p>`; }
        });

        function populateDetailModal(product) {
            detailModalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>Temel Bilgiler</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item editable-field" data-field-name="Name" data-label="Ürün Adı"><b>Ad:</b> ${product.name}</li>
                            <li class="list-group-item editable-field" data-field-name="Sku" data-label="Stok Kodu"><b>SKU:</b> ${product.sku}</li>
                            <li class="list-group-item editable-field" data-field-name="SalePrice" data-label="Satış Fiyatı"><b>Satış Fiyatı:</b> ${product.salePrice.toFixed(2)} ₺</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h5>Diğer Detaylar</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item editable-field" data-field-name="Renk" data-label="Renk"><b>Renk:</b> ${product.renk || '-'}</li>
                            <li class="list-group-item editable-field" data-field-name="Malzeme" data-label="Malzeme"><b>Malzeme:</b> ${product.malzeme || '-'}</li>
                        </ul>
                    </div>
                </div>`;
        }

        fetchAndRenderProducts();
    }

    detailModalBody.addEventListener('click', (e) => {
        const field = e.target.closest('.editable-field');
        if (!field) return;
        
        activeFieldName = field.dataset.fieldName;
        activeFieldLabel = field.dataset.label;
        const currentValue = field.textContent.split(':')[1].trim();
        
        editModalLabel.textContent = `${activeFieldLabel} için yeni değer girin:`;
        editFieldValueInput.value = currentValue.endsWith('₺') ? currentValue.slice(0, -2).trim() : currentValue;
        editModal.show();
    });

    saveFieldButton.addEventListener('click', async () => {
        if (!activeProductId || !activeFieldName) return;

        const newValue = editFieldValueInput.value;
        const token = localStorage.getItem('authToken');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${activeProductId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ fieldName: activeFieldName, newValue: newValue })
            });

            if (!response.ok) { const err = await response.json(); throw new Error(err.message); }
            
            editModal.hide();
            detailModal.hide();
            window.showSuccessModal("Ürün başarıyla güncellendi.");
            const productOperationsTab = document.querySelector('[data-page="Products/urun-islemleri.html"]');
            if(productOperationsTab) productOperationsTab.click();

        } catch(error) { alert(error.message); }
    });

     form.addEventListener('submit', async (e) => {
        e.preventDefault();
        addButton.disabled = true;
        messageArea.innerHTML = '';
        try {
        const newCategory = {
            name: categoryNameInput.value,
            description: categoryDescInput.value
        };
           
            const response = await fetch(`${API_BASE_URL}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newCategory)
            });
            
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Kategori eklenemedi.');
            
            form.reset();
            await fetchAndRenderCategories();
            
        } catch (error) {
            messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            addButton.disabled = false;
        }
    });
    fetchAndRenderCategories();
  }


    function initializeBrandsPage(container) {
        const token = localStorage.getItem('authToken');
        if (!token) { window.location.href = 'invlogin.html'; return; }

        const brandList = container.querySelector('#brand-list');
        const form = container.querySelector('#brand-form');
        const brandNameInput = container.querySelector('#brand-name');
        const brandDescInput = container.querySelector('#brand-description');
        const messageArea = container.querySelector('#form-message-area');
        const addButton = form.querySelector('button[type="submit"]');

        async function fetchAndRenderBrands() {
           brandList.innerHTML = `<div class="text-center p-4"><div class="spinner-border spinner-border-sm"></div></div>`;
          try {
            const response = await fetch(`${API_BASE_URL}/api/brands`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Markalar yüklenemedi.');
            const brands = await response.json();
            renderBrandList(brands, brandList);
          } catch (error) {
            brandList.innerHTML = `<div class="text-danger text-center p-3">${error.message}</div>`;
         }
       }

     function renderBrandList(brands, listElement) {
        if (!brands || brands.length === 0) { listElement.innerHTML = '<div class="text-muted text-center p-3">Henüz hiç marka eklenmemiş.</div>'; return; }
        listElement.innerHTML = brands.map(b => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div><strong class="d-block">${b.name}</strong><small class="text-muted">${b.description || ''}</small></div>
                <div><button class="btn btn-sm btn-outline-danger delete-brand-btn" data-id="${b.id}" data-name="${b.name}" title="Sil"><i class="fas fa-trash fa-fw"></i></button></div>
            </div>`).join('');
     }

     brandList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-brand-btn');
        if (deleteButton) {
            itemToDeleteId = deleteButton.dataset.id;
            itemToDeleteName = deleteButton.dataset.name;
            afterDeleteCallback = fetchAndRenderBrands;
            deleteEndpoint = '/api/brands';
            deleteModalBody.textContent = `'${itemToDeleteName}' adlı markayı silmek istediğinize emin misiniz?`;
            deleteModal.show();
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        addButton.disabled = true;
        try {
            const newBrand = { name: brandNameInput.value, description: brandDescInput.value };
            const response = await fetch(`${API_BASE_URL}/api/brands`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newBrand)
            });
            if (!response.ok) { const error = await response.json(); throw new Error(error.message); }
            form.reset();
            await fetchAndRenderBrands();
        } catch (error) {
            messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            addButton.disabled = false;
        }
    });

    fetchAndRenderBrands();
  }


function initializeNewOrderPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const form = container.querySelector('#new-order-form');
    const customerSearchInput = container.querySelector('#customer-search');
    const orderNotesInput = container.querySelector('#order-notes');
    const productSearchInput = container.querySelector('#product-search');
    const productSearchResults = container.querySelector('#product-search-results');
    const useSpecialPriceCheck = container.querySelector('#use-special-price-check');
    const priceListContainer = container.querySelector('#price-list-container'); // Bu ID HTML'de olmalı
    const priceListSelect = container.querySelector('#price-list-select'); // Bu ID HTML'de olmalı
    const productQuantityInput = container.querySelector('#product-quantity');
    const priceListSelectionModal = new bootstrap.Modal(document.getElementById('priceListSelectionModal'));
    const priceListModalBody = document.getElementById('priceListModalBody');
    const productPriceInput = container.querySelector('#product-price');
    const addItemBtn = container.querySelector('#add-item-btn');
    const orderItemsBody = container.querySelector('#order-items-body');
    const orderTotalElement = container.querySelector('#order-total');
    const customerSearchResults = container.querySelector('#customer-search-results');
    

    let shoppingCart = [];
    let selectedCustomerId = null;
    let selectedProduct = null;
    let debounceTimer;
    

    
    function updatePriceSection() {
        if (!selectedProduct) return;

        const hasPriceLists = selectedProduct.priceLists && selectedProduct.priceLists.length > 0;
        useSpecialPriceCheck.disabled = !hasPriceLists;

        if (useSpecialPriceCheck.checked && hasPriceLists) {
            priceListContainer.style.display = 'block';
            priceListSelect.innerHTML = selectedProduct.priceLists.map(pl => 
                `<option value="${pl.priceListId}" data-price="${pl.specialPrice}">${pl.priceListName}</option>`
            ).join('');
            productPriceInput.value = (selectedProduct.priceLists[0].specialPrice || 0).toFixed(2);
        } else {
            priceListContainer.style.display = 'none';
            productPriceInput.value = (selectedProduct.salePrice || 0).toFixed(2);
        }
    }

    function renderShoppingCart() {
        if (shoppingCart.length === 0) {
            orderItemsBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-3">Sipariş sepeti boş.</td></tr>`;
            orderTotalElement.textContent = "0.00 ₺";
            return;
        }
        let totalAmount = 0;
        orderItemsBody.innerHTML = shoppingCart.map((item, index) => {
            const itemTotal = item.quantity * item.unitPrice;
            totalAmount += itemTotal;
            return `
                <tr>
                    <td>${item.productName} (${item.sku})</td>
                    <td>${item.quantity}</td>
                    <td class="text-end">${item.unitPrice.toFixed(2)} ₺</td>
                    <td class="text-end fw-bold">${itemTotal.toFixed(2)} ₺</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}"><i class="fas fa-times"></i></button>
                    </td>
                </tr>`;
        }).join('');
        orderTotalElement.textContent = `${totalAmount.toFixed(2)} ₺`;
    }

    function resetProductEntry() {
        productSearchInput.value = '';
        productQuantityInput.value = '1';
        productPriceInput.value = '';
        selectedProduct = null;
        useSpecialPriceCheck.checked = false;
        useSpecialPriceCheck.disabled = true;
        priceListContainer.style.display = 'none';
        productSearchInput.focus();
    }

     customerSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) { customerSearchResults.style.display = 'none'; return; }
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/cariler?search=${searchTerm}&type=Musteri`, { headers: { 'Authorization': `Bearer ${token}` } });
                const cariler = await response.json();
                
                if (cariler && cariler.length > 0) {
                    customerSearchResults.innerHTML = cariler.map(c => 
                        `<a href="#" class="list-group-item list-group-item-action" data-cari-id="${c.id}" data-cari-unvan="${c.unvan}">${c.unvan} (${c.cariKodu})</a>`
                    ).join('');
                } else {
                    customerSearchResults.innerHTML = '<span class="list-group-item disabled">Sonuç bulunamadı</span>';
                }
                customerSearchResults.style.display = 'block';
            } catch (error) { console.error("Müşteri araması hatası:", error); }
        }, 300);
    });

    customerSearchResults.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target) {
            selectedCustomerId = parseInt(target.dataset.cariId);
            customerSearchInput.value = target.dataset.cariUnvan;
            customerSearchResults.style.display = 'none';
        }
    });
    productSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) {
            productSearchResults.style.display = 'none';
            return;
        }
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products?search=${searchTerm}&pageSize=5`, { headers: { 'Authorization': `Bearer ${token}` } });
                const result = await response.json();
                
                if (result.items && result.items.length > 0) {
                    productSearchResults.innerHTML = result.items.map(p => 
                        `<a href="#" class="list-group-item list-group-item-action py-2" data-product='${JSON.stringify(p)}'>
                            <div><strong>${p.name}</strong></div>
                            <small class="text-muted">SKU: ${p.sku}</small>
                        </a>`
                    ).join('');
                } else {
                    productSearchResults.innerHTML = '<span class="list-group-item disabled">Sonuç bulunamadı</span>';
                }
                productSearchResults.style.display = 'block';
            } catch (error) { console.error("Ürün araması hatası:", error); }
        }, 300);
    });
    productSearchResults.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target) {
            selectedProduct = JSON.parse(target.dataset.product);
            productSearchInput.value = `${selectedProduct.name} (${selectedProduct.sku})`;
            productSearchResults.style.display = 'none';
            
            productPriceInput.value = (selectedProduct.salePrice || 0).toFixed(2);
            useSpecialPriceCheck.checked = false;
            useSpecialPriceCheck.disabled = !(selectedProduct.priceLists && selectedProduct.priceLists.length > 0);
            
            productQuantityInput.focus();
        }
    });
    useSpecialPriceCheck.addEventListener('change', () => {
        if (!selectedProduct) { useSpecialPriceCheck.checked = false; return; }

        if (useSpecialPriceCheck.checked) {
            if (selectedProduct.priceLists && selectedProduct.priceLists.length > 0) {
                priceListModalBody.innerHTML = selectedProduct.priceLists.map(pl => 
                    `<a href="#" class="list-group-item list-group-item-action price-list-option" data-price="${pl.specialPrice}">
                        <strong>${pl.priceListName}</strong>
                        <span class="float-end fw-bold">${pl.specialPrice.toFixed(2)} ₺</span>
                    </a>`
                ).join('');
                priceListSelectionModal.show();
            } else {
                alert("Bu ürün için tanımlı bir özel fiyat listesi bulunamadı.");
                useSpecialPriceCheck.checked = false;
            }
        } else {
            productPriceInput.value = (selectedProduct.salePrice || 0).toFixed(2);
        }
    });

    priceListSelect.addEventListener('change', () => {
        const selectedOption = priceListSelect.options[priceListSelect.selectedIndex];
        productPriceInput.value = parseFloat(selectedOption.dataset.price).toFixed(2);
    });
    priceListModalBody.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('.price-list-option');
        if(target){
            productPriceInput.value = parseFloat(target.dataset.price).toFixed(2);
            priceListSelectionModal.hide();
        }
    });
    addItemBtn.addEventListener('click', () => {
        const quantity = parseInt(productQuantityInput.value);
        const unitPrice = parseFloat(productPriceInput.value);
        if (!selectedProduct || !quantity || quantity <= 0 || !unitPrice || unitPrice < 0) {
            alert("Lütfen geçerli bir ürün seçin ve miktar/fiyat girin.");
            return;
        }
        shoppingCart.push({
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            quantity: quantity,
            unitPrice: unitPrice
        });
        renderShoppingCart();
        resetProductEntry();
    });
    orderItemsBody.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-item-btn');
        if(removeButton) {
            shoppingCart.splice(parseInt(removeButton.dataset.index), 1);
            renderShoppingCart();
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (shoppingCart.length === 0) { alert("Lütfen siparişe en az bir ürün ekleyin."); return; }
        const orderData = {
            cariId: selectedCustomerId,
            notes: orderNotesInput.value,   
            items: shoppingCart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }))
        };
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Sipariş oluşturulamadı.");
            
            window.showSuccessModal(`'${result.orderNumber}' numaralı siparişiniz başarıyla oluşturuldu.`);
            shoppingCart = [];
            renderShoppingCart();
            form.reset();
        } catch (error) { alert(`Hata: ${error.message}`); }
    });
    renderShoppingCart(); 
}


  function initializeOrderListPage(container) {
     const token = localStorage.getItem('authToken');
     if (!token) { window.location.href = 'invlogin.html'; return; }

     const tableBody = container.querySelector('#sales-orders-table-body');
     const filterInputs = container.querySelectorAll('.filter-input');
    
     // Modal Elemanları
     const shipmentConfirmationModal = new bootstrap.Modal(document.getElementById('shipmentConfirmationModal'));
     const shipmentModalBodyText = document.getElementById('shipmentModalBodyText');
     const confirmShipmentButton = document.getElementById('confirmShipmentButton');
    
     const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
     const docModalTitle = document.getElementById('documentModalTitle');
     const docModalContent = document.getElementById('documentModalContent');

   
    
     let orderToShipId = null;
     let orderToShipNumber = null;
     let debounceTimer;

     
     async function fetchAndRenderSalesOrders() {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        
        const params = new URLSearchParams();
        filterInputs.forEach(input => {
            if (input.value) {
                params.append(input.dataset.filterkey, input.value);
            }
        });

        const apiUrl = `${API_BASE_URL}/api/orders?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Satış siparişleri yüklenemedi.');
            const orders = await response.json();

            if (!orders || orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Filtreye uygun sipariş bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = orders.map(order => {
                let actionButton = `<button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${order.id}" title="Detayları Gör"><i class="fas fa-search"></i></button>`;
                if (order.status === 'Hazırlanıyor' || order.status === 'Onaylandı') {
                     actionButton = `<button class="btn btn-sm btn-primary ship-order-btn" data-id="${order.id}" data-number="${order.orderNumber}" title="Siparişi Sevk Et"><i class="fas fa-truck"></i></button>`;
                }
                
                return `
                    <tr class="sales-order-row" data-id="${order.id}" style="cursor:pointer;" title="Detayları görüntüle">
                        <td><strong>${order.orderNumber}</strong></td>
                        <td>${new Date(order.orderDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>${order.cariName}</td>
                        <td class="text-end fw-bold">${order.totalAmount.toFixed(2)} ₺</td>
                        <td class="text-center"><span class="badge bg-info">${order.status}</span></td>
                        <td class="text-center">${actionButton}</td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }
    


    filterInputs.forEach(input => {
        if (input.type === 'text') {
            input.addEventListener('keyup', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    fetchAndRenderSalesOrders();
                }, 500);
            });
        }
        input.addEventListener('change', fetchAndRenderSalesOrders);
    });

     tableBody.addEventListener('click', async (e) => {
        const shipButton = e.target.closest('.ship-order-btn');
        const row = e.target.closest('.sales-order-row');

        if (shipButton) {
            e.stopPropagation();
            orderToShipId = shipButton.dataset.id;
            orderToShipNumber = shipButton.dataset.number;
            shipmentModalBodyText.textContent = `'${orderToShipNumber}' numaralı siparişi sevk edip irsaliye oluşturmak istediğinize emin misiniz?`;
            shipmentConfirmationModal.show();
        } else if (row) {
           const orderId = row.dataset.id;
            docModalTitle.textContent = "Satış Siparişi Detayı Yükleniyor...";
            docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
            docModal.show();
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Sipariş detayı alınamadı.");
                }
                const data = await response.json();
                
                docModalTitle.textContent = data.documentType;
                renderDocumentTemplate(data);
            } catch(error) {
                docModalContent.innerHTML = `<p class="text-danger text-center p-4">${error.message}</p>`;
            }
        }
    });
    
    confirmShipmentButton.addEventListener('click', async () => {
        if (!orderToShipId) return;

        confirmShipmentButton.disabled = true;
        confirmShipmentButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Sevk Ediliyor...`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/shipments/create-waybill/${orderToShipId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'İrsaliye oluşturulamadı.');
            }
            
            shipmentConfirmationModal.hide();
            window.showSuccessModal(`'${result.orderNumber}' siparişi için '${result.waybillNumber}' numaralı irsaliye oluşturuldu.`);
            await fetchAndRenderSalesOrders();

        } catch (error) {
            shipmentModalBodyText.innerHTML = `<div class="alert alert-danger p-2 m-0">${error.message}</div>`;
        } finally {
            confirmShipmentButton.disabled = false;
            confirmShipmentButton.innerHTML = "Evet, Sevk Et";
            orderToShipId = null;
            orderToShipNumber = null;
        }
    });
    fetchAndRenderSalesOrders();
}



function initializeWaybillsPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }
    const tableBody = container.querySelector('#waybills-table-body');
    const filterInputs = container.querySelectorAll('.filter-input');
    const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
    const docModalTitle = document.getElementById('documentModalTitle');
    const docModalContent = document.getElementById('documentModalContent');
    const docModalActionButtons = document.getElementById('documentModalActionButtons');

    const confirmationModal = new bootstrap.Modal(document.getElementById('genericConfirmationModal'));
    const confirmButton = document.getElementById('genericConfirmButton');
    const modalTitle = document.getElementById('genericModalTitle');
    const modalBody = document.getElementById('genericModalBody');

    let activeWaybillId = null;
    let debounceTimer;
    if (!tableBody || filterInputs.length === 0) {
        console.error("Satış İrsaliyeleri sayfasındaki tablo (#waybills-table-body) veya filtre inputları (.filter-input) bulunamadı.");
        return;
    }

    async function fetchAndRenderWaybills() {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        
        const params = new URLSearchParams();
        filterInputs.forEach(input => {
            if (input.value) {
                params.append(input.dataset.filterkey, input.value);
            }
        });

        const apiUrl = `${API_BASE_URL}/api/waybills?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Satış irsaliyeleri yüklenemedi.');
            const waybills = await response.json();

            if (!waybills || waybills.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4">Filtreye uygun irsaliye bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = waybills.map(wb => `
                <tr class="waybill-row" data-id="${wb.id}" data-status="${wb.status || ''}" style="cursor:pointer;" title="Detayları gör">
                    <td><strong>${wb.waybillNumber}</strong></td>
                    <td>${new Date(wb.shipmentDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>${wb.orderNumber}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary" title="Detayları Gör"><i class="fas fa-search"></i></button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }


    filterInputs.forEach(input => {
        if (input.type === 'text') {
            input.addEventListener('keyup', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { fetchAndRenderWaybills(); }, 500);
            });
        } else {
            input.addEventListener('change', fetchAndRenderWaybills);
        }
    });

    tableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('.waybill-row');
        if (row) {
            const waybillId = row.dataset.id;
            const waybillStatus = row.dataset.status;
            activeWaybillId = waybillId;
            
            docModalTitle.textContent = "İrsaliye Detayı Yükleniyor...";
            docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
            docModalActionButtons.innerHTML = ''; 
            if (waybillStatus !== 'Faturalaştı') {
                const invoiceButton = document.createElement('button');
                invoiceButton.className = 'btn btn-sm btn-success';
                invoiceButton.innerHTML = `<i class="fas fa-file-invoice-dollar me-1"></i> Faturalaştır`;
                invoiceButton.onclick = () => {
                    modalTitle.textContent = 'Faturalaştırma Onayı';
                    modalBody.textContent = `Bu irsaliyeyi faturalaştırmak istediğinize emin misiniz?`;
                    confirmButton.onclick = createInvoice;
                    confirmationModal.show();
                };
                docModalActionButtons.appendChild(invoiceButton);
            }

            docModal.show();

            try {
                const response = await fetch(`${API_BASE_URL}/api/waybills/${waybillId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(errorData.message || "İrsaliye detayı alınamadı.");
                }
                const data = await response.json();
                renderDocumentTemplate(data);
                docModalTitle.textContent = data.documentType;
            } catch(error) {
                docModalContent.innerHTML = `<p class="text-danger text-center p-4">${error.message}</p>`;
            }
        }
    });
    async function createInvoice() {
        if (!activeWaybillId) return;

        confirmButton.disabled = true;
        confirmButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> İşleniyor...`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/invoices/create-from-waybill/${activeWaybillId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Fatura oluşturulamadı.");
            
            confirmationModal.hide();
            docModal.hide();
            window.showSuccessModal(result.message || `İrsaliye başarıyla faturalaştırıldı.`);
            await fetchAndRenderWaybills();
        } catch (error) {
            modalBody.innerHTML = `<div class="alert alert-danger mt-3 p-2">${error.message}</div>`;
        } finally {
            confirmButton.disabled = false;
            confirmButton.innerHTML = "Evet, Onayla";
            activeWaybillId = null;
        }
    }
    fetchAndRenderWaybills();
}
function initializeShipmentsPage(container) {

    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; } 

    const tableBody = container.querySelector('#shipments-table-body');
    const searchInput = container.querySelector('#shipment-search-input');
    const searchButton = container.querySelector('#shipment-search-button');
    if (!tableBody || !searchInput || !searchButton) {
        console.error("Sevk edilecekler tablosu (#shipments-table-body) bulunamadı.");
        return;
    }
    let debounceTimer;
     async function fetchAndRenderShipments(search = '') {
        const searchTerm = search.trim();
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        
        const apiUrl = `${API_BASE_URL}/api/orders/to-be-shipped?orderNumber=${encodeURIComponent(searchTerm)}`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 401) { window.location.href = 'invlogin.html'; return; }
            if (!response.ok) throw new Error('Sevk edilecek siparişler yüklenemedi.');

            const orders = await response.json();

            if (!orders || orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Sevk edilmeyi bekleyen sipariş bulunmuyor.</td></tr>`;
                return;
            }

            tableBody.innerHTML = orders.map(order => {
                const orderDate = new Date(order.orderDate).toLocaleDateString('tr-TR');
                return `
                    <tr>
                        <td><strong>${order.orderNumber}</strong></td>
                        <td>${orderDate}</td>
                        <td>${order.cariName}</td>
                        <td class="text-end fw-bold">${order.totalAmount.toFixed(2)} ₺</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-primary ship-order-btn" data-id="${order.id}" data-number="${order.orderNumber}">
                                <i class="fas fa-truck me-1"></i> Sevk Et
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger p-4">${error.message}</td></tr>`;
        }
    }
    
    
    searchButton.addEventListener('click', () => {
        fetchAndRenderShipments(searchInput.value);
    });

    searchInput.addEventListener('keyup', (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchAndRenderShipments(searchInput.value);
        }, 500); 
    });

    tableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('.waybill-row');
      if (row) {
      const waybillId = row.dataset.id;
      activeWaybillId = waybillId; 

     docModalTitle.textContent = "İrsaliye Detayı Yükleniyor...";
     docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
     docModalActionButtons.innerHTML = '';
     const invoiceButton = document.createElement('button');
     invoiceButton.className = 'btn btn-sm btn-success';
     invoiceButton.innerHTML = `<i class="fas fa-file-invoice-dollar me-1"></i> Faturalaştır`;
     invoiceButton.onclick = () => {
        modalTitle.textContent = 'Faturalaştırma Onayı';
        modalBody.textContent = `Bu irsaliyeyi faturalaştırmak istediğinize emin misiniz? Bu işlem geri alınamaz.`;
        confirmationModal.show();
     };
     docModalActionButtons.appendChild(invoiceButton);
 
     docModal.show();
     try {
         const response = await fetch(`${API_BASE_URL}/api/waybills/${waybillId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || "İrsaliye detayı alınamadı.");
        }
        const data = await response.json();
        renderDocumentTemplate(data);
        docModalTitle.textContent = data.documentType;
     } catch(error) {
        docModalContent.innerHTML = `<p class="text-danger text-center p-4">${error.message}</p>`;
     }
}
        
    });
    confirmShipmentButton.addEventListener('click', async () => {
      if (!orderToShipId) return;

     const token = localStorage.getItem('authToken');
     const originalButtonText = "Evet, Sevk Et";
     confirmShipmentButton.disabled = true;
     confirmShipmentButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> İşleniyor...`;

     try {
        const response = await fetch(`${API_BASE_URL}/api/shipments/create-waybill/${orderToShipId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Sevk işlemi başarısız.');
        
        shipmentModal.hide();

        window.showSuccessModal(`'${result.orderNumber}' siparişi için '${result.waybillNumber}' numaralı irsaliye oluşturuldu.`);
        const shipmentsTabLink = document.querySelector(`[data-page="Orders/sevk-edilecekler.html"]`);
        if (shipmentsTabLink) {
            shipmentsTabLink.click();
        }
        } catch (error) {
        shipmentModalBodyText.innerHTML = `<div class="alert alert-danger p-2 m-0">${error.message}</div>`;
    } finally {
        orderToShipId = null;
        orderToShipNumber = null;
        confirmShipmentButton.disabled = false;
        confirmShipmentButton.innerHTML = originalButtonText;
    }
   });

    fetchAndRenderShipments();
}

confirmInvoiceButton.addEventListener('click', async () => {
    if (!waybillToInvoiceId) return;

    const token = localStorage.getItem('authToken');
    const originalButtonText = "Evet, Faturalaştır";
    confirmInvoiceButton.disabled = true;
    confirmInvoiceButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> İşleniyor...`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/create-from-waybill/${waybillToInvoiceId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Fatura oluşturulamadı.');

        invoiceModal.hide();
        waybillModal.hide();
        
        window.showSuccessModal(`İrsaliye başarıyla faturalaştırıldı. Yeni Fatura No: ${result.invoiceNumber}`);

        const invoicesTabLink = document.querySelector(`[data-page="Siparisler/satis-faturalari.html"]`);
        if (invoicesTabLink) {
            invoicesTabLink.click();
        }

    } catch (error) {
        invoiceModalBodyText.innerHTML = `<div class="alert alert-danger p-2 m-0">${error.message}</div>`;
    } finally {
        waybillToInvoiceId = null;
        confirmInvoiceButton.disabled = false;
        confirmInvoiceButton.innerHTML = originalButtonText;
    }
});
    


function initializePurchaseOrderListPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }


    const tableBody = container.querySelector('#purchase-orders-table-body');
    const filterInputs = container.querySelectorAll('.filter-input');
    const confirmationModal = new bootstrap.Modal(document.getElementById('genericConfirmationModal'));
    const confirmButton = document.getElementById('genericConfirmButton');
    const modalTitle = document.getElementById('genericModalTitle');
    const modalBody = document.getElementById('genericModalBody');
    
    const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
    const docModalTitle = document.getElementById('documentModalTitle');

    

    let orderToUpdateId = null;
    let newStatusToSet = null;
    let debounceTimer;

    

 
   async function fetchAndRenderPurchaseOrders() {
        
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        const params = new URLSearchParams();
        filterInputs.forEach(input => {
            if (input.value) {
                params.append(input.dataset.filterkey, input.value);
            }
        });
        const apiUrl = `${API_BASE_URL}/api/purchaseorders?${params.toString()}`;
        
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Satın alma siparişleri yüklenemedi.');
            const orders = await response.json();

            if (!orders || orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Gösterilecek satın alma siparişi bulunamadı.</td></tr>`;
                return;
            }

             tableBody.innerHTML = orders.map(order => {
                let statusBadge = '';
                let actionContent = `<span class="text-muted fst-italic">İşlem Yok</span>`;

                switch (order.status) {
                    case 'Gönderildi':
                        statusBadge = `<span class="badge bg-info">${order.status}</span>`;
                        actionContent = `<span class="text-muted fst-italic"  style="background-color:darkred;color:white !important;border-radius:3px;">Mal Kabul Bekliyor</span>`;
                        break;
                    case 'Teslim Alındı':
                        statusBadge = `<span class="badge bg-dark">${order.status}</span>`;
                        actionContent = `<span class="text-muted fst-italic" style="background-color:green;color:white !important;border-radius:5px;">Tamamlandı</span>`;
                        break;
                    case 'İptal Edildi':
                         statusBadge = `<span class="badge bg-danger">${order.status}</span>`;
                         actionContent = `<span class="text-muted fst-italic" style="background-color:red;border-radius:5px;color:white !important">İşlem Yok</span>`;
                         break;
                }
                
                return `
                    <tr class="purchase-order-row" data-id="${order.id}" style="cursor:pointer;" title="Sipariş Detayını Görüntüle">
                        <td><strong>${order.purchaseOrderNumber}</strong></td>
                         <td>${new Date(order.orderDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>${order.supplierName}</td>
                        <td class="text-end fw-bold">${order.totalAmount.toFixed(2)} ₺</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center">${actionContent}</td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">${error.message}</td></tr>`;
        }
    }

    filterInputs.forEach(input => {
        if (input.type === 'text') {
            input.addEventListener('keyup', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { fetchAndRenderPurchaseOrders(); }, 500);
            });
        } else {
            input.addEventListener('change', fetchAndRenderPurchaseOrders);
        }
    });

    


    tableBody.addEventListener('click', async (e) => {
       const completeBtn = e.target.closest('.complete-order-btn');
        const statusBtn = e.target.closest('.status-update-btn');
        const row = e.target.closest('.purchase-order-row');

        if (completeBtn) {
            e.stopPropagation(); 
            orderToUpdateId = completeBtn.dataset.id;
            newStatusToSet = 'Teslim Alındı';
            modalTitle.textContent = 'Teslimat Onayı';
            modalBody.textContent = `Bu siparişteki ürünleri teslim aldığınızı onaylıyor musunuz? Bu işlem, ürünleri stoğunuza ekleyecektir.`;
            confirmationModal.show();
        } else if (statusBtn) {
            e.stopPropagation();
            orderToUpdateId = statusBtn.dataset.id;
            newStatusToSet = statusBtn.dataset.newStatus;
            modalTitle.textContent = 'Durum Güncelleme';
            modalBody.textContent = `Siparişin durumunu "${newStatusToSet}" olarak güncellemek istediğinize emin misiniz?`;
            confirmationModal.show();
        }
        else if(row){
           const orderId = row.dataset.id;
           docModalTitle.textContent = "Satın Alma Siparişi Detayı Yükleniyor...";
           document.getElementById('documentModalContent').innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
           docModal.show();

            try {
                const response = await fetch(`${API_BASE_URL}/api/purchaseorders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if(!response.ok) {
                    const errorData = await response.json();
                   throw new Error(errorData.message || "Sipariş detayı alınamadı.");
                }
            const data = await response.json();
        
            docModalTitle.textContent = data.documentType;
            renderDocumentTemplate(data);
        }   catch(error) {
                document.getElementById('documentModalContent').innerHTML = `<p class="text-danger text-center p-4">${error.message}</p>`;
        }
        }
    });

    confirmButton.addEventListener('click', async () => {
        if (!orderToUpdateId || !newStatusToSet) return;

        confirmButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/purchaseorders/${orderToUpdateId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newStatus: newStatusToSet })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            confirmationModal.hide();
            window.showSuccessModal(result.message);
            await fetchAndRenderPurchaseOrders();

        } catch (error) {
            modalBody.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        } finally {
            confirmButton.disabled = false;
            orderToUpdateId = null;
            newStatusToSet = null;
        }
    });

    fetchAndRenderPurchaseOrders();
}



function initializePurchaseWaybillsPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'invlogin.html';
        return;
    }

    const tableBody = container.querySelector('#purchase-waybills-table-body');
    const filterInputs = container.querySelectorAll('.filter-input');
    const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
    const docModalTitle = document.getElementById('documentModalTitle');
    const docModalContent = document.getElementById('documentModalContent');
    const docModalActionButtons = document.getElementById('documentModalActionButtons');
    const confirmationModal = new bootstrap.Modal(document.getElementById('genericConfirmationModal'));
    const confirmButton = document.getElementById('genericConfirmButton');
    const modalTitle = document.getElementById('genericModalTitle');
    const modalBody = document.getElementById('genericModalBody');
    let debounceTimer;


    

    let activeWaybillId = null;

    async function fetchAndRenderPurchaseWaybills(search = '') {
        
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        const params = new URLSearchParams();
        filterInputs.forEach(input => {
            if (input.value) {
                params.append(input.dataset.filterkey, input.value);
            }
        })
        const apiUrl = `${API_BASE_URL}/api/purchasewaybills?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Alış irsaliyeleri yüklenemedi.');
            const waybills = await response.json();

            if (!waybills || waybills.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4">Alış irsaliyesi bulunmuyor.</td></tr>`;
                return;
            }

            tableBody.innerHTML = waybills.map(wb => `
                <tr class="purchase-waybill-row" data-id="${wb.id}" style="cursor:pointer;" title="Detayları gör">
                    <td><strong>${wb.waybillNumber}</strong></td>
                    <td>${new Date(wb.arrivalDate).toLocaleString('tr-TR' ,{ dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>${wb.purchaseOrderNumber}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary"><i class="fas fa-search-plus"></i></button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }

    
    tableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('.purchase-waybill-row');
        if (row) {
            const waybillId = row.dataset.id;
            const waybillStatus = row.dataset.status;
            activeWaybillId = waybillId;
            
            docModalTitle.textContent = "Alış İrsaliyesi Detayı Yükleniyor...";
            docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
            docModalActionButtons.innerHTML = '';

            if (waybillStatus !== 'Faturalaştı') {
                const invoiceButton = document.createElement('button');
                invoiceButton.className = 'btn btn-sm btn-success';
                invoiceButton.innerHTML = `<i class="fas fa-file-invoice-dollar me-1"></i> Faturalaştır`;
                invoiceButton.onclick = () => {
                    modalTitle.textContent = 'Faturalaştırma Onayı';
                    modalBody.textContent = `Bu alış irsaliyesini faturalaştırmak istediğinize emin misiniz?`;
                    confirmButton.onclick = createInvoice;
                    confirmationModal.show();
                };
                docModalActionButtons.appendChild(invoiceButton);
            }

            docModal.show();

            try {
                const response = await fetch(`${API_BASE_URL}/api/purchasewaybills/${waybillId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(errorData.message || "İrsaliye detayı alınamadı.");
                }
                const data = await response.json();
                renderDocumentTemplate(data);
                docModalTitle.textContent = data.documentType;
            } catch(error) {
                docModalContent.innerHTML = `<p class="text-danger text-center p-4">${error.message}</p>`;
            }
        }
    });
    

    
     filterInputs.forEach(input => {
        if (input.type === 'text') {
            input.addEventListener('keyup', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { fetchAndRenderPurchaseWaybills(); }, 500);
            });
        } else {
            input.addEventListener('change', fetchAndRenderPurchaseWaybills);
        }
    });
    async function createInvoice(waybillId, type) {
       if (!activeWaybillId) return;

        confirmButton.disabled = true;
        confirmButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> İşleniyor...`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/purchaseinvoices/create-from-waybill/${activeWaybillId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Fatura oluşturulamadı.");
            
            confirmationModal.hide();
            docModal.hide();
            window.showSuccessModal(result.message || `İrsaliye başarıyla faturalaştırıldı.`);
            await fetchAndRenderPurchaseWaybills();
        } catch (error) {
            modalBody.innerHTML = `<div class="alert alert-danger mt-3 p-2">${error.message}</div>`;
        } finally {
            confirmButton.disabled = false;
            confirmButton.innerHTML = "Evet, Onayla";
            activeWaybillId = null;
        }
}


    fetchAndRenderPurchaseWaybills();
}




function initializePurchaseInvoicesPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#purchase-invoices-table-body');
    const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
    const docModalTitle = document.getElementById('documentModalTitle');
    const docModalContent = document.getElementById('documentModalContent');
    const docModalActionButtons = document.getElementById('documentModalActionButtons');
    const filterInputs = container.querySelectorAll('.filter-input');
    let debounceTimer;
    

   
    async function fetchAndRenderPurchaseInvoices(search = '') {
        
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        const params = new URLSearchParams();
        filterInputs.forEach(input => {
            if (input.value) {
                params.append(input.dataset.filterkey, input.value);
            }
        });
        const apiUrl = `${API_BASE_URL}/api/purchaseinvoices?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Alış faturaları yüklenemedi.');
            const invoices = await response.json();

            if (!invoices || invoices.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Gösterilecek alış faturası bulunmuyor.</td></tr>`;
                return;
            }
            tableBody.innerHTML = invoices.map(inv => {
                const invoiceDate = new Date(inv.invoiceDate).toLocaleDateString('tr-TR');
                const isPaid = inv.status === 'Ödendi';
                return `
                    <tr class="purchase-invoice-row" data-id="${inv.id}" data-status="${inv.status}" style="cursor:pointer;" title="Detayları Gör ve İşlem Yap">
                        <td><strong>${inv.invoiceNumber}</strong></td>
                        <td>${new Date(inv.invoiceDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>${inv.supplierName}</td>
                        <td class="text-end fw-bold">${inv.totalAmount.toFixed(2)} ₺</td>
                        <td class="text-center"><span class="badge ${isPaid ? 'bg-success' : 'bg-warning'}">${inv.status}</span></td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }

    tableBody.addEventListener('click', async (e) => {
       const row = e.target.closest('.purchase-invoice-row');
       if (row) {
      const invoiceId = row.dataset.id;
      const invoiceStatus = row.dataset.status;

     docModalTitle.textContent = "Fatura Detayı Yükleniyor...";
     docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
     docModalActionButtons.innerHTML = '';

    
    docModal.show();

    try {
        const response = await fetch(`${API_BASE_URL}/api/purchaseinvoices/${invoiceId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Fatura detayı alınamadı.");
        }
        const data = await response.json();
        
        docModalTitle.textContent = data.documentType;
        renderDocumentTemplate(data);
    } catch(error) {
        docModalContent.innerHTML = `<p class="text-danger p-4">${error.message}</p>`;
    }
}
    });
     filterInputs.forEach(input => {
        if (input.type === 'text') {
            input.addEventListener('keyup', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { fetchAndRenderPurchaseInvoices(); }, 500);
            });
        } else {
            input.addEventListener('change', fetchAndRenderPurchaseInvoices);
        }
    });
    fetchAndRenderPurchaseInvoices();
}





function initializeNewPurchaseOrderPage(container) {
   const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const form = container.querySelector('#new-purchase-order-form');
    const supplierSearchInput = container.querySelector('#supplier-search');
    const supplierSearchResults = container.querySelector('#supplier-search-results');
    const orderNotesInput = container.querySelector('#order-notes'); // ID düzeltildi
    const productSearchInput = container.querySelector('#product-search');
    const productSearchResults = container.querySelector('#product-search-results');
    const productQuantityInput = container.querySelector('#product-quantity');
    const productPriceInput = container.querySelector('#product-price'); // Eksik tanım eklendi
    const addItemBtn = container.querySelector('#add-item-btn'); // ID düzeltildi
    const orderItemsBody = container.querySelector('#order-items-body'); // ID düzeltildi

    let shoppingCart = [];
    let selectedSupplierId = null;
    let selectedProduct = null;
    let debounceTimer;

    function renderShoppingCart() {
        if (shoppingCart.length === 0) {
            orderItemsBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-3">Sipariş sepeti boş.</td></tr>`;
            return;
        }
        
        let total = 0;
        orderItemsBody.innerHTML = shoppingCart.map((item, index) => {
            const itemTotal = item.quantity * item.purchasePrice;
            total += itemTotal;
            return `
            <tr>
                <td>${item.productName} (${item.sku})</td>
                <td>${item.quantity}</td>
                <td class="text-end">${item.purchasePrice.toFixed(2)} ₺</td>
                <td class="text-end">${itemTotal.toFixed(2)} ₺</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}"><i class="fas fa-times"></i></button>
                </td>
            </tr>`;
        }).join('');
        
        // Toplam tutarı güncelle
        document.getElementById('order-total').textContent = total.toFixed(2) + ' ₺';
    }

    function resetProductEntry() {
        productSearchInput.value = '';
        productQuantityInput.value = '1';
        productPriceInput.value = '';
        selectedProduct = null;
        productSearchInput.focus();
    }

    // ELEMENT KONTROLLERİ - NULL CHECK EKLENDİ
    if (!supplierSearchInput) {
        console.error('supplierSearchInput bulunamadı');
        return;
    }
    if (!productSearchInput) {
        console.error('productSearchInput bulunamadı');
        return;
    }
    if (!addItemBtn) {
        console.error('addItemBtn bulunamadı');
        return;
    }
    if (!orderItemsBody) {
        console.error('orderItemsBody bulunamadı');
        return;
    }
    if (!form) {
        console.error('form bulunamadı');
        return;
    }

    supplierSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) { 
            if(supplierSearchResults) supplierSearchResults.style.display = 'none'; 
            return; 
        }
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/cariler?search=${searchTerm}&type=Tedarikçi`, { headers: { 'Authorization': `Bearer ${token}` } });
                const cariler = await response.json();
                if (supplierSearchResults) {
                    supplierSearchResults.innerHTML = cariler && cariler.length > 0
                        ? cariler.map(c => `<a href="#" class="list-group-item list-group-item-action" data-cari-id="${c.id}" data-cari-unvan="${c.unvan}">${c.unvan} (${c.cariKodu})</a>`).join('')
                        : '<span class="list-group-item disabled">Sonuç bulunamadı</span>';
                    supplierSearchResults.style.display = 'block';
                }
            } catch (error) { console.error("Tedarikçi araması hatası:", error); }
        }, 300);
    });

    if (supplierSearchResults) {
        supplierSearchResults.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (target) {
                selectedSupplierId = parseInt(target.dataset.cariId);
                supplierSearchInput.value = target.dataset.cariUnvan;
                supplierSearchResults.style.display = 'none';
            }
        });
    }

    productSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) { 
            if(productSearchResults) productSearchResults.style.display = 'none'; 
            return; 
        }
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products?search=${searchTerm}&pageSize=5`, { headers: { 'Authorization': `Bearer ${token}` } });
                const result = await response.json();
                if (productSearchResults) {
                    if (result.items && result.items.length > 0) {
                        productSearchResults.innerHTML = result.items.map(p => 
                            `<a href="#" class="list-group-item list-group-item-action py-2" data-product='${JSON.stringify(p)}'>
                                <div><strong>${p.name}</strong></div><small class="text-muted">SKU: ${p.sku}</small>
                            </a>`
                        ).join('');
                    } else {
                        productSearchResults.innerHTML = '<span class="list-group-item disabled">Sonuç bulunamadı</span>';
                    }
                    productSearchResults.style.display = 'block';
                }
            } catch (error) { console.error("Ürün araması hatası:", error); }
        }, 300);
    });

    if (productSearchResults) {
        productSearchResults.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (target) {
                selectedProduct = JSON.parse(target.dataset.product);
                productSearchInput.value = `${selectedProduct.name} (${selectedProduct.sku})`;
                productSearchResults.style.display = 'none';
                if (productPriceInput) {
                    productPriceInput.value = (selectedProduct.purchasePrice || 0).toFixed(2);
                }
                productQuantityInput.focus();
            }
        });
    }
    
    addItemBtn.addEventListener('click', () => {
        const quantity = parseInt(productQuantityInput.value);
        if (!selectedProduct || !quantity || quantity <= 0) {
            alert("Lütfen arama yaparak bir ürün seçin ve geçerli bir miktar girin.");
            return;
        }
        const unitPrice = selectedProduct.purchasePrice || 0;
        shoppingCart.push({
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            quantity: quantity,
            purchasePrice: unitPrice,
            unitPrice: unitPrice
        });
        
        renderShoppingCart();
        resetProductEntry();
    });

    orderItemsBody.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-item-btn');
        if(removeButton) {
            shoppingCart.splice(parseInt(removeButton.dataset.index), 1);
            renderShoppingCart();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedSupplierId) { alert("Lütfen bir tedarikçi seçin."); return; }
        if (shoppingCart.length === 0) { alert("Lütfen siparişe en az bir ürün ekleyin."); return; }
        const orderData = {
            cariId: selectedSupplierId,
            notes: orderNotesInput ? orderNotesInput.value : '',
            items: shoppingCart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }))
        };
        try {
            const response = await fetch(`${API_BASE_URL}/api/purchaseorders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Satın alma siparişi oluşturulamadı.");
            
            if (window.showSuccessModal) {
                window.showSuccessModal(`'${result.purchaseOrderNumber}' numaralı siparişiniz başarıyla oluşturuldu.`);
            } else {
                alert(`'${result.purchaseOrderNumber}' numaralı siparişiniz başarıyla oluşturuldu.`);
            }
            shoppingCart = [];
            renderShoppingCart();
            form.reset();
            selectedSupplierId = null;
        } catch (error) { alert(`Hata: ${error.message}`); }
    });

    renderShoppingCart();
}






  function initializePriceListsPage(container) { 
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const priceListsContainer = container.querySelector('#price-lists-container');
    const selectedListTitle = container.querySelector('#selected-list-title');
    const itemsWrapper = container.querySelector('#price-list-items-wrapper');
    const itemsTableBody = container.querySelector('#price-list-items-table');
    const addProductForm = container.querySelector('#add-product-to-list-form');
    const productSearchInput = container.querySelector('#product-search-input');
    const specialPriceInput = container.querySelector('#special-price-input');
    const newListButton = container.querySelector('#new-list-btn');
    const priceListModalElement = document.getElementById('priceListModal');
    const priceListModal = new bootstrap.Modal(priceListModalElement);
    const savePriceListButton = document.getElementById('save-price-list-button');
    const priceListNameInput = document.getElementById('price-list-name');
    const priceListDescInput = document.getElementById('price-list-description');
    const clearListButton = container.querySelector('#clear-list-btn');
    const searchResultsDiv = document.createElement('div');
    searchResultsDiv.className = 'list-group position-absolute w-100';
    searchResultsDiv.style.zIndex = '1000';
    searchResultsDiv.style.display = 'none';
    productSearchInput.parentElement.appendChild(searchResultsDiv);

    let selectedListId = null;
    let selectedProduct = null; 
    let debounceTimer;


    async function fetchAndRenderPriceLists() {
        priceListsContainer.innerHTML = `<div class="p-3 text-center"><div class="spinner-border spinner-border-sm"></div></div>`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/pricelists`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Fiyat listeleri yüklenemedi.');
            const priceLists = await response.json();

            if (!priceLists || priceLists.length === 0) {
                priceListsContainer.innerHTML = '<div class="text-muted text-center p-3">Fiyat listesi bulunamadı.</div>';
                return;
            }
            priceListsContainer.innerHTML = priceLists.map(pl => `
                <a href="#" class="list-group-item list-group-item-action" data-list-id="${pl.id}" data-list-name="${pl.name}">
                    ${pl.name}
                </a>`).join('');
        } catch (error) {
            priceListsContainer.innerHTML = `<div class="text-danger text-center p-3">${error.message}</div>`;
        }
    }

    async function loadPriceListItems(listId, listName) {
        selectedListId = listId;
        selectedListTitle.textContent = `'${listName}' Listesinin İçeriği`;
        itemsWrapper.style.display = 'block';
        clearListButton.style.display = 'inline-block';
        itemsTableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4"><div class="spinner-border text-primary"></div></td></tr>`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/pricelists/${listId}/items`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Liste içeriği yüklenemedi.');
            const items = await response.json();
            if (!items || items.length === 0) { itemsTableBody.innerHTML = '<tr><td colspan="4" class="text-center p-3">Bu listede henüz ürün yok.</td></tr>'; return; }
            itemsTableBody.innerHTML = items.map(item => `
                <tr>
                    <td>${item.sku}</td>
                    <td>${item.productName}</td>
                    <td class="text-end fw-bold">${item.specialPrice.toFixed(2)} ₺</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger delete-item-btn" data-item-id="${item.id}" data-name="${item.productName}"><i class="fas fa-times"></i></button>
                    </td>
                </tr>`).join('');
        } catch (error) { itemsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${error.message}</td></tr>`; }
    }


    async function addProductToList() {
        const specialPrice = parseFloat(specialPriceInput.value);
        if (!selectedProduct || !specialPrice || specialPrice <= 0) {
            alert('Lütfen arama yaparak bir ürün seçin ve geçerli bir fiyat girin.');
            return;
        }
        const data = { productId: selectedProduct.id, specialPrice: specialPrice };
        try {
            const response = await fetch(`${API_BASE_URL}/api/pricelists/${selectedListId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json(); throw new Error(err.message || 'Ürün listeye eklenemedi.');
            }
            loadPriceListItems(selectedListId, selectedListTitle.textContent.split("'")[1]);
            productSearchInput.value = '';
            specialPriceInput.value = '';
            selectedProduct = null;
        } catch (error) { alert(error.message); }
    }



    priceListsContainer.addEventListener('click', (e) => {
        const link = e.target.closest('.list-group-item');
        if (link) {
            e.preventDefault();
            document.querySelectorAll('#price-lists-container .list-group-item').forEach(el => el.classList.remove('active'));
            link.classList.add('active');
            
            const listId = link.dataset.listId;
            const listName = link.dataset.listName;
            loadPriceListItems(listId, listName);
        }
    });
    clearListButton.addEventListener('click', () => {
    if (!selectedListId) {
        alert("Lütfen önce bir fiyat listesi seçin.");
        return;
    }

    const listName = selectedListTitle.textContent.split("'")[1] || "seçili liste";
    
    itemToDeleteId = selectedListId; 
    itemToDeleteName = listName; 
    afterDeleteCallback = () => loadPriceListItems(selectedListId, listName);
    deleteEndpoint = `/api/pricelists/${selectedListId}/items`; 
    
    deleteModalBody.textContent = `'${listName}' listesindeki TÜM ürünleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
    
    
    deleteModal.show();
 });

    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProductToList();
    });
    productSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;

        if (searchTerm.length < 2) {
            searchResultsDiv.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products?search=${searchTerm}&pageSize=5`, { headers: { 'Authorization': `Bearer ${token}` } });
                if(!response.ok) return;
                const result = await response.json();
                
                if (result.items && result.items.length > 0) {
                    searchResultsDiv.innerHTML = result.items.map(p => 
                        `<a href="#" class="list-group-item list-group-item-action py-2" data-product='${JSON.stringify(p)}'>
                            <div><strong>${p.name}</strong></div>
                            <small class="text-muted">SKU: ${p.sku}</small>
                        </a>`
                    ).join('');
                } else {
                    searchResultsDiv.innerHTML = '<span class="list-group-item disabled">Sonuç bulunamadı</span>';
                }
                searchResultsDiv.style.display = 'block';
            } catch (error) {
                console.error("Ürün araması hatası:", error);
            }
        }, 300); 
    });
    searchResultsDiv.addEventListener('click', (e) => {
         e.preventDefault();
        const target = e.target.closest('a');
        if (target) {
            selectedProduct = JSON.parse(target.dataset.product);
            productSearchInput.value = selectedProduct.name; 
            searchResultsDiv.style.display = 'none'; 
            specialPriceInput.focus();
        }
    });

    itemsTableBody.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-item-btn');
        if (deleteButton) {
            itemToDeleteId = deleteButton.dataset.itemId;
            itemToDeleteName = deleteButton.dataset.name;
            afterDeleteCallback = () => loadPriceListItems(selectedListId, selectedListTitle.textContent.split("'")[1]);
            deleteEndpoint = '/api/pricelists/items';
            deleteModalBody.textContent = `'${itemToDeleteName}' adlı ürünü bu fiyat listesinden kaldırmak istediğinize emin misiniz?`;
            deleteModal.show();
        }
    });
    newListButton.addEventListener('click', () => {
         document.getElementById('price-list-form').reset();
         priceListModal.show()

    });
    savePriceListButton.addEventListener('click', async () => {
        const listName = priceListNameInput.value;
        const listDesc = priceListDescInput.value;

        if (!listName) {
            alert("Fiyat listesi adı zorunludur.");
            return;
        }

        const newListData = { name: listName, description: listDesc };
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/pricelists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newListData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Fiyat listesi oluşturulamadı.');
            }
            
            priceListModal.hide(); 
            await fetchAndRenderPriceLists(); 
            
        } catch (error) {
            alert(error.message);
        }
    });
    fetchAndRenderPriceLists();
   }  

   function initializeNewCariPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const form = container.querySelector('#new-cari-form');
    if (!form) { console.error("Yeni cari formu bulunamadı!"); return; }

    const saveButton = form.querySelector('button[type="submit"]');
    const messageArea = container.querySelector('#form-message-area');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        saveButton.disabled = true;
        saveButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Kaydediliyor...`;
        messageArea.innerHTML = '';
        const newCariData = {
            unvan: container.querySelector('#cari-unvan').value,
            cariKodu: container.querySelector('#cari-kodu').value,
            cariTipi: container.querySelector('#cari-tipi').value,
            vergiDairesi: container.querySelector('#cari-vergi-dairesi').value,
            vergiNo: container.querySelector('#cari-vergi-no').value,
            adres: container.querySelector('#cari-adres').value,
            telefon: container.querySelector('#cari-telefon').value,
            email: container.querySelector('#cari-email').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/cariler`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newCariData)
            });

            const result = await response.json();
            if (!response.ok) {
                if (response.status === 409 && result.CariKodu) { 
                    throw new Error(result.CariKodu[0]);
                }
                throw new Error(result.message || 'Cari oluşturulamadı.');
            }
            
            window.showSuccessModal(`'${result.unvan}' adlı cari başarıyla oluşturuldu.`);
            form.reset();

        } catch (error) {
            messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = `<i class="fas fa-save me-2"></i>Cari Kartını Kaydet`;
        }
    });
}
function initializeCariListPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }
    const tableBody = container.querySelector('#cariler-table-body');
    const filterInputs = container.querySelectorAll('.datagrid-filter-row input');
    const openNewCariButton = container.querySelector('#open-new-cari-tab');
    
    let filters = {}; 
    let debounceTimer;

    async function fetchAndRenderCariler() {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        
    
        const queryParams = new URLSearchParams(filters);
        const apiUrl = `${API_BASE_URL}/api/cariler?${queryParams.toString()}`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Cariler yüklenemedi.');
            const cariler = await response.json();

            if (!cariler || cariler.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Filtreye uygun cari bulunamadı.</td></tr>`;
                return;
            }
            
            tableBody.innerHTML = cariler.map(cari => `
                <tr>
                    <td><strong>${cari.cariKodu}</strong></td>
                    <td>${cari.unvan}</td>
                    <td>${cari.cariTipi}</td>
                    <td>${cari.telefon || '-'}</td>
                    <td>${cari.email || '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary edit-cari-btn" 
                                data-id="${cari.id}" 
                                data-name="${cari.unvan}" 
                                title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1 delete-cari-btn" 
                                data-id="${cari.id}" 
                                data-name="${cari.unvan}" 
                                title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }
    filterInputs.forEach(input => {
        input.addEventListener('keyup', (event) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const key = event.target.getAttribute('data-filter-key');
                const value = event.target.value;

                if (value) {
                    filters[key] = value;
                } else {
                    delete filters[key];
                }
                
                fetchAndRenderCariler();
            }, 500);
        });
    });

    openNewCariButton.addEventListener('click', () => {
        window.openTab('Cariler/yeni-cari.html', 'Yeni Cari Ekle');
    });

    tableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-cari-btn');
        const deleteButton = e.target.closest('.delete-cari-btn');
        if (editButton) {
            const cariId = editButton.dataset.id;
            const cariName = editButton.dataset.name;
            const pageUrl = `Cariler/cari-duzenle.html?id=${cariId}`;
            window.openTab(pageUrl, `${cariName} - Düzenle`);
        }
        if (deleteButton){
            itemToDeleteId = deleteButton.dataset.id;
            itemToDeleteName = deleteButton.dataset.name;
            afterDeleteCallback = fetchAndRenderCariler;
            deleteEndpoint = '/api/cariler'; 
            
            deleteModalBody.textContent = `'${itemToDeleteName}' adlı cariyi silmek istediğinize emin misiniz? Bu işlem, cariyi pasif hale getirecektir.`;
            deleteModal.show();
        }
    });
    fetchAndRenderCariler();
}
function initializeCariEditPage(container, pageUrl) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'invlogin.html';
        return;
    }

    const urlParams = new URLSearchParams(pageUrl.split('?')[1]);
    const cariId = urlParams.get('id');

    if (!cariId) {
        container.innerHTML = `<div class="alert alert-danger m-4">Geçersiz cari ID'si.</div>`;
        return;
    }

    const form = container.querySelector('#edit-cari-form');
    if (!form) {
        console.error("Düzenleme formu ('#edit-cari-form') bu sekmede bulunamadı!");
        return;
    }

    const saveButton = container.querySelector('#update-cari-button');
    const messageArea = container.querySelector('#edit-cari-message-area');
    const pageTitle = container.querySelector('#edit-cari-page-title');
    const unvanInput = container.querySelector('#edit-cari-unvan');
    const koduInput = container.querySelector('#edit-cari-kodu');
    const tipiSelect = container.querySelector('#edit-cari-tipi');
    const vergiDairesiInput = container.querySelector('#edit-cari-vergi-dairesi');
    const vergiNoInput = container.querySelector('#edit-cari-vergi-no');
    const adresInput = container.querySelector('#edit-cari-adres');
    const telefonInput = container.querySelector('#edit-cari-telefon');
    const emailInput = container.querySelector('#edit-cari-email');
    async function loadCariDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cariler/${cariId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Cari detayları yüklenemedi.');
            const cari = await response.json();
            
            if(pageTitle) pageTitle.textContent = `'${cari.unvan}' Düzenleniyor`;
            if(unvanInput) unvanInput.value = cari.unvan || '';
            if(koduInput) koduInput.value = cari.cariKodu || '';
            if(tipiSelect) tipiSelect.value = cari.cariTipi || '';
            if(vergiDairesiInput) vergiDairesiInput.value = cari.vergiDairesi || '';
            if(vergiNoInput) vergiNoInput.value = cari.vergiNo || '';
            if(adresInput) adresInput.value = cari.adres || '';
            if(telefonInput) telefonInput.value = cari.telefon || '';
            if(emailInput) emailInput.value = cari.email || '';

        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger m-4">${error.message}</div>`;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Güncelleniyor...`;
        if(messageArea) messageArea.innerHTML = '';
        const updatedCariData = {
            unvan: unvanInput.value,
            cariKodu: koduInput.value,
            cariTipi: tipiSelect.value,
            vergiDairesi: vergiDairesiInput.value,
            vergiNo: vergiNoInput.value,
            adres: adresInput.value,
            telefon: telefonInput.value,
            email: emailInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/cariler/${cariId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedCariData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Güncelleme başarısız oldu.');
            }
            
            window.showSuccessModal('Cari başarıyla güncellendi.');
            
            const cariListTabButton = document.querySelector('[data-page="Cariler/cari-listesi.html"]');
            if(cariListTabButton) cariListTabButton.click();

        } catch (error) {
            if(messageArea) messageArea.innerHTML = `<div class="alert alert-danger p-2">${error.message}</div>`;
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-check me-2"></i>Değişiklikleri Kaydet';
        }
    });

    loadCariDetails();
}
function initializeCariTransactionsPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }
    

    const searchInput = container.querySelector('#cari-extre-search');
    const searchResults = container.querySelector('#cari-extre-search-results');
    const summaryPanel = container.querySelector('#cari-summary');
    const selectedCariNameEl = container.querySelector('#selected-cari-name');
    const summaryDebitEl = container.querySelector('#summary-debit');
    const summaryCreditEl = container.querySelector('#summary-credit');
    const summaryBalanceEl = container.querySelector('#summary-balance');
    const tableBody = container.querySelector('#cari-transactions-body');
    let debounceTimer;


    if (!searchInput || !searchResults || !summaryPanel || !tableBody) {
        console.error("Cari Hareketleri (Ekstre) sayfası için gerekli HTML elemanları bulunamadı.");
        return;
    }


    searchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/cariler?search=${encodeURIComponent(searchTerm)}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error("Cariler yüklenemedi.");
                
                const cariler = await response.json();
                if (cariler && cariler.length > 0) {
                    searchResults.innerHTML = cariler.map(c => 
                        `<a href="#" class="list-group-item list-group-item-action" data-cari-id="${c.id}" data-cari-name="${c.unvan}">
                            ${c.unvan} <small class="text-muted">(${c.cariKodu})</small>
                         </a>`
                    ).join('');
                } else {
                    searchResults.innerHTML = '<span class="list-group-item disabled">Sonuç bulunamadı</span>';
                }
                searchResults.style.display = 'block';
            } catch (error) {
                console.error("Cari arama hatası:", error);
                searchResults.innerHTML = `<span class="list-group-item text-danger">${error.message}</span>`;
                searchResults.style.display = 'block';
            }
        }, 300);
    });

    searchResults.addEventListener('click', async (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (!target) return;

        const cariId = target.dataset.cariId;
        const cariName = target.dataset.cariName;
        
        searchInput.value = cariName;
        searchResults.style.display = 'none';
        selectedCariNameEl.textContent = cariName;
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        summaryPanel.style.display = 'none'; 

        try {
            const response = await fetch(`${API_BASE_URL}/api/reports/cari-statement/${cariId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Hesap ekstresi yüklenemedi.');
            const statementItems = await response.json();

            let balance = 0;
            let totalDebit = 0; 
            let totalCredit = 0;
            
            if (statementItems && statementItems.length > 0) {
                tableBody.innerHTML = statementItems.map(item => {
                    balance += item.credit - item.debit;
                    totalDebit += item.debit;
                    totalCredit += item.credit;
                    return `
                        <tr>
                            <td>${new Date(item.date).toLocaleDateString('tr-TR')}</td>
                            <td>${item.description}</td>
                            <td class="text-end text-danger">${item.debit > 0 ? item.debit.toFixed(2) + ' ₺' : ''}</td>
                            <td class="text-end text-success">${item.credit > 0 ? item.credit.toFixed(2) + ' ₺' : ''}</td>
                            <td class="text-end fw-bold">${balance.toFixed(2)} ₺</td>
                        </tr>`;
                }).join('');
            } else {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Bu cariye ait hareket bulunmuyor.</td></tr>`;
            }
            summaryDebitEl.textContent = `${totalDebit.toFixed(2)} ₺`;
            summaryCreditEl.textContent = `${totalCredit.toFixed(2)} ₺`;
            summaryBalanceEl.textContent = `${balance.toFixed(2)} ₺`;
            summaryBalanceEl.className = balance >= 0 ? 'fw-bold text-success' : 'fw-bold text-danger';
            summaryPanel.style.display = 'block';

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    });
}



function initializeNewCollectionSlipPage(container) {
   const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const form = container.querySelector('#new-collection-slip-form');
    const accountSelect = container.querySelector('#cash-bank-account-select');
    const dateInput = container.querySelector('#transaction-date');
    const descriptionInput = container.querySelector('#transaction-description');
    const invoiceSearchInput = container.querySelector('#invoice-search');
    const invoiceSearchResults = container.querySelector('#invoice-search-results');
    const selectedInvoiceAmountEl = container.querySelector('#selected-invoice-amount');
    const saveButton = form.querySelector('button[type="submit"]');


    let selectedInvoiceId = null;
    let debounceTimer;


    async function populateAccounts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cashandbankaccounts`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Hesaplar yüklenemedi.');
            const accounts = await response.json();
            accountSelect.innerHTML = '<option value="" disabled selected>Bir hesap seçin...</option>';
            accounts.forEach(acc => {
                accountSelect.innerHTML += `<option value="${acc.id}">${acc.name} (${acc.currency})</option>`;
            });
        } catch (error) {
            accountSelect.innerHTML = `<option value="" disabled>${error.message}</option>`;
        }
    }


    invoiceSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) {
            invoiceSearchResults.style.display = 'none';
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/collections/search-invoices?search=${encodeURIComponent(searchTerm)}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Faturalar aranırken bir hata oluştu.');
                const invoices = await response.json();
                
                if (invoices && invoices.length > 0) {
                    invoiceSearchResults.innerHTML = invoices.map(inv => 
                        `<a href="#" class="list-group-item list-group-item-action" 
                            data-invoice-id="${inv.id}" 
                            data-invoice-amount="${inv.totalAmount}" 
                            data-invoice-text="${inv.invoiceNumber} - ${inv.customerName}">
                            ${inv.invoiceNumber} - ${inv.customerName} (${inv.totalAmount.toFixed(2)} ₺)
                         </a>`
                    ).join('');
                } else {
                    invoiceSearchResults.innerHTML = '<span class="list-group-item disabled">Ödenecek fatura bulunamadı</span>';
                }
                invoiceSearchResults.style.display = 'block';
            } catch (error) {
                console.error("Fatura araması hatası:", error);
            }
        }, 500);
    });

    invoiceSearchResults.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target) {
            selectedInvoiceId = parseInt(target.dataset.invoiceId);
            const selectedInvoiceAmount = parseFloat(target.dataset.invoiceAmount);
            invoiceSearchInput.value = target.dataset.invoiceText;
            selectedInvoiceAmountEl.textContent = `${selectedInvoiceAmount.toFixed(2)} ₺`;
            invoiceSearchResults.style.display = 'none';
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedInvoiceId || !accountSelect.value || !dateInput.value) {
            alert("Lütfen bir fatura, hesap ve tarih seçin.");
            return;
        }

        saveButton.disabled = true;
        saveButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Kaydediliyor...`;

        const transactionData = {
            transactionDate: dateInput.value,
            cashAndBankAccountId: parseInt(accountSelect.value),
            relatedInvoiceId: selectedInvoiceId,
            description: descriptionInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/collections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(transactionData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Tahsilat kaydedilemedi.');
            
            window.showSuccessModal(result.message);
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            selectedInvoiceAmountEl.textContent = '0.00 ₺';
            selectedInvoiceId = null;
        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = `<i class="fas fa-plus me-2"></i>Tahsilatı Kaydet`;
        }
    });
    dateInput.value = new Date().toISOString().split('T')[0];
    populateAccounts();
}


function initializeNewOdemePage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }


    const form = container.querySelector('#new-payment-slip-form');
    const accountSelect = container.querySelector('#cash-bank-account-select');
    const dateInput = container.querySelector('#transaction-date');
    const descriptionInput = container.querySelector('#transaction-description');
    const invoiceSearchInput = container.querySelector('#invoice-search');
    const invoiceSearchResults = container.querySelector('#invoice-search-results');
    const selectedInvoiceAmountEl = container.querySelector('#selected-invoice-amount');
    const saveButton = form.querySelector('button[type="submit"]');


    let selectedInvoiceId = null;
    let debounceTimer;

    async function populateAccounts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cashandbankaccounts`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Hesaplar yüklenemedi.');
            const accounts = await response.json();
            accountSelect.innerHTML = '<option value="" disabled selected>Bir hesap seçin...</option>';
            accounts.forEach(acc => {
                accountSelect.innerHTML += `<option value="${acc.id}">${acc.name} (${acc.currency})</option>`;
            });
        } catch (error) {
            accountSelect.innerHTML = `<option value="" disabled>${error.message}</option>`;
        }
    }

   
    
    
    invoiceSearchInput.addEventListener('keyup', (e) => {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value;
        if (searchTerm.length < 2) {
            invoiceSearchResults.style.display = 'none';
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/payments/search-invoices?search=${encodeURIComponent(searchTerm)}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Faturalar aranırken bir hata oluştu.');
                const invoices = await response.json();
                
                if (invoices && invoices.length > 0) {
                    invoiceSearchResults.innerHTML = invoices.map(inv => 
                        `<a href="#" class="list-group-item list-group-item-action" 
                            data-invoice-id="${inv.id}" 
                            data-invoice-amount="${inv.totalAmount}" 
                            data-invoice-text="${inv.invoiceNumber} - ${inv.supplierName}">
                            ${inv.invoiceNumber} - ${inv.supplierName} (${inv.totalAmount.toFixed(2)} ₺)
                         </a>`
                    ).join('');
                } else {
                    invoiceSearchResults.innerHTML = '<span class="list-group-item disabled">Ödenecek fatura bulunamadı</span>';
                }
                invoiceSearchResults.style.display = 'block';
            } catch (error) {
                console.error("Alış faturası araması hatası:", error);
            }
        }, 500);
    });

    invoiceSearchResults.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target) {
            selectedInvoiceId = parseInt(target.dataset.invoiceId);
            const selectedInvoiceAmount = parseFloat(target.dataset.invoiceAmount);
            invoiceSearchInput.value = target.dataset.invoiceText;
            selectedInvoiceAmountEl.textContent = `${selectedInvoiceAmount.toFixed(2)} ₺`;
            invoiceSearchResults.style.display = 'none';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedInvoiceId || !accountSelect.value || !dateInput.value) {
            alert("Lütfen bir fatura, hesap ve tarih seçin.");
            return;
        }

        saveButton.disabled = true;
        saveButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Kaydediliyor...`;

        const transactionData = {
            transactionDate: dateInput.value,
            cashAndBankAccountId: parseInt(accountSelect.value),
            relatedInvoiceId: selectedInvoiceId,
            description: descriptionInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(transactionData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Ödeme kaydedilemedi.');
            
            window.showSuccessModal(result.message);
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            selectedInvoiceAmountEl.textContent = '0.00 ₺';
            selectedInvoiceId = null;
        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = `<i class="fas fa-minus me-2"></i>Ödemeyi Kaydet`;
        }
    });

    dateInput.value = new Date().toISOString().split('T')[0];
    populateAccounts();
}
function initializeBorcAlacakReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const totalReceivablesEl = container.querySelector('#total-receivables');
    const totalPayablesEl = container.querySelector('#total-payables');
    const receivablesBody = container.querySelector('#receivables-table-body');
    const payablesBody = container.querySelector('#payables-table-body');
    
    async function fetchAndRenderReport() {
        receivablesBody.innerHTML = `<tr><td colspan="2" class="text-center p-4"><div class="spinner-border spinner-border-sm"></div></td></tr>`;
        payablesBody.innerHTML = `<tr><td colspan="2" class="text-center p-4"><div class="spinner-border spinner-border-sm"></div></td></tr>`;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/reports/borc-alacak`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Rapor verileri yüklenemedi.");
            const report = await response.json();

            totalReceivablesEl.textContent = `${report.totalReceivables.toFixed(2)} ₺`;
            totalPayablesEl.textContent = `${report.totalPayables.toFixed(2)} ₺`;

            if (report.receivables.length > 0) {
                receivablesBody.innerHTML = report.receivables.map(r => `
                    <tr><td>${r.cariName}</td><td class="text-end fw-bold">${r.balance.toFixed(2)} ₺</td></tr>`).join('');
            } else {
                receivablesBody.innerHTML = `<tr><td colspan="2" class="text-center p-3">Ödenmemiş alacak bulunmuyor.</td></tr>`;
            }

            if (report.payables.length > 0) {
                payablesBody.innerHTML = report.payables.map(p => `
                    <tr><td>${p.cariName}</td><td class="text-end fw-bold">${p.balance.toFixed(2)} ₺</td></tr>`).join('');
            } else {
                payablesBody.innerHTML = `<tr><td colspan="2" class="text-center p-3">Ödenmemiş borç bulunmuyor.</td></tr>`;
            }

        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    fetchAndRenderReport();
}
function initializeStockStatusReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#stock-report-table-body');
    if (!tableBody) { console.error("Stok raporu tablosu bulunamadı."); return; }

    async function fetchAndRenderReport() {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/reportscontroller2/stock-status`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Stok raporu yüklenemedi.');
            const reportData = await response.json();

            if (!reportData || reportData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Raporlanacak ürün bulunmuyor.</td></tr>`;
                return;
            }

            tableBody.innerHTML = reportData.map(item => {
                let statusClass = '';
                switch (item.stockStatus) {
                    case 'Kritik Seviyede': statusClass = 'text-warning'; break;
                    case 'Tükenmiş': statusClass = 'text-danger'; break;
                    default: statusClass = 'text-success';
                }
                return `
                    <tr>
                        <td><strong>${item.sku}</strong></td>
                        <td>${item.name}</td>
                        <td class="text-center fw-bold">${item.stockQuantity}</td>
                        <td>${item.unitName}</td>
                        <td class="text-end">${item.totalStockValue.toFixed(2)} ₺</td>
                        <td class="text-center">
                            <span class="badge bg-light ${statusClass} border fw-semibold">${item.stockStatus}</span>
                        </td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger p-4">${error.message}</td></tr>`;
        }
    }
    
    fetchAndRenderReport();
}

function initializeStockMovementsPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#stock-movements-table-body');
    const filterForm = container.querySelector('#stock-movements-filter-form');
    const productInput = container.querySelector('#filter-product');
    const typeInput = container.querySelector('#filter-type');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');

    async function fetchAndRenderMovements(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        
        const params = new URLSearchParams();
        if (filters.productSearch) params.append('productSearch', filters.productSearch);
        if (filters.movementType) params.append('movementType', filters.movementType);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const apiUrl = `${API_BASE_URL}/api/reports/stock-movements?${params.toString()}`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Stok hareketleri yüklenemedi.');
            const movements = await response.json();

            if (!movements || movements.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Seçilen kriterlere uygun stok hareketi bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = movements.map(m => `
                <tr>
                    <td>${new Date(m.movementDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>${m.productName} <strong>(${m.productSku})</strong></td>
                    <td>${m.movementType}</td>
                    <td class="text-center fw-bold ${m.quantityChange > 0 ? 'text-success' : 'text-danger'}">${m.quantityChange > 0 ? '+' : ''}${m.quantityChange}</td>
                    <td>${m.relatedDocument || '-'}</td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const filters = {
            productSearch: productInput.value,
            movementType: typeInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };
        fetchAndRenderMovements(filters);
    });

    fetchAndRenderMovements();
}
function initializeGoodsReceiptPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }


    const tableBody = container.querySelector('#goods-receipt-table-body');
    const confirmationModal = new bootstrap.Modal(document.getElementById('genericConfirmationModal'));
    const confirmButton = document.getElementById('genericConfirmButton');
    const modalTitle = document.getElementById('genericModalTitle');
    const modalBody = document.getElementById('genericModalBody');

    let orderToUpdateId = null;
    let newStatusToSet = null;

    async function fetchAndRenderIncomingOrders() {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        const apiUrl = `${API_BASE_URL}/api/purchaseorders?status=Gönderildi`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Mal kabul bekleyen siparişler yüklenemedi.');
            const orders = await response.json();

            if (!orders || orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Mal kabul bekleyen sipariş bulunmuyor.</td></tr>`;
                return;
            }

            tableBody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>${order.purchaseOrderNumber}</strong></td>
                    <td>${new Date(order.orderDate).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>${order.supplierName}</td>
                    <td class="text-end fw-bold">${order.totalAmount.toFixed(2)} ₺</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-success receive-order-btn" data-id="${order.id}" title="Ürünleri Teslim Al ve Stoğa Ekle">
                            <i class="fas fa-box-check me-1"></i> Teslim Al
                        </button>
                        <button class="btn btn-sm btn-danger cancel-order-btn" data-id="${order.id}" title="Siparişi İptal Et">
                                <i class="fas fa-times me-1"></i> İptal Et
                        </button>
                    </td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }


      tableBody.addEventListener('click', (e) => {
        const receiveBtn = e.target.closest('.receive-order-btn');
        const cancelBtn = e.target.closest('.cancel-order-btn');

        if (receiveBtn) {
            orderToUpdateId = receiveBtn.dataset.id;
            newStatusToSet = 'Teslim Alındı';
            modalTitle.textContent = 'Mal Kabul Onayı';
            modalBody.textContent = `Bu siparişteki ürünleri teslim aldığınızı onaylıyor musunuz? Bu işlem, ürünleri stoğunuza ekleyecektir.`;
            confirmationModal.show();
        } else if (cancelBtn) {
            orderToUpdateId = cancelBtn.dataset.id;
            newStatusToSet = 'İptal Edildi';
            modalTitle.textContent = 'Sipariş İptal Onayı';
            modalBody.textContent = `Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.`;
            confirmationModal.show();
        }
    });
    confirmButton.addEventListener('click', async () => {
        if (!orderToUpdateId || !newStatusToSet) return;

        confirmButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/purchaseorders/${orderToUpdateId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newStatus: newStatusToSet })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            confirmationModal.hide();
            window.showSuccessModal(result.message);
            await fetchAndRenderIncomingOrders(); // Listeyi yenile

        } catch (error) {
            modalBody.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        } finally {
            confirmButton.disabled = false;
            orderToUpdateId = null;
            newStatusToSet = null;
        }
    });
    

    fetchAndRenderIncomingOrders();
}


function initializeMonthlyTurnoverReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const chartCanvas = container.querySelector('#monthlyTurnoverChart');
    const exportButton = container.querySelector('#export-to-excel-btn');

    if (!chartCanvas || !exportButton) {
        console.error("Rapor sayfası için gerekli HTML elemanları bulunamadı.");
        return;
    }

    async function fetchAndRenderReport() {
        try {
           
            const response = await fetch(`${API_BASE_URL}/api/reports/monthly-turnover`, { headers: { 'Authorization': `Bearer ${token}` } });
            
          
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sunucu hatası: ${response.status} - ${errorText}`);
            }

            const reportData = await response.json();

            if (chartCanvas.chart) {
                chartCanvas.chart.destroy();
            }
            
            chartCanvas.chart = new Chart(chartCanvas, {
                type: 'bar', 
                data: {
                    labels: reportData.labels,
                    datasets: [
                        {
                            label: 'Ciro (₺)',
                            data: reportData.turnoverData,
                            type: 'line', 
                            borderColor: '#1cc88a', 
                            backgroundColor: 'rgba(28, 200, 138, 0.1)',
                            fill: true,
                            tension: 0.3,
                            order: 0 
                        },
                        {
                            label: 'Toplam Satış (₺)',
                            data: reportData.salesData,
                            backgroundColor: '#4e73df', 
                            order: 1
                        },
                        {
                            label: 'Toplam Alış (₺)',
                            data: reportData.purchasesData,
                            backgroundColor: '#f6c23e', 
                            order: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) { label += ': '; }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Rapor verisi yüklenemedi veya çizilemedi:", error);
            const ctx = chartCanvas.getContext('2d');
            ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText("Rapor verileri yüklenirken bir hata oluştu. Lütfen konsolu kontrol edin.", 10, 50);
        }
    }
    exportButton.addEventListener('click', () => {
        const exportUrl = `${API_BASE_URL}/api/reports/monthly-turnover/export`;
        
        fetch(exportUrl, { headers: { 'Authorization': `Bearer ${token}` }})
            .then(res => {
                if (!res.ok) throw new Error("Dosya oluşturulamadı.");
                return res.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `AylikCiroRaporu_${new Date().toISOString().slice(0,10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch((err) => alert(`Dosya indirilemedi: ${err.message}`));
    });
    
    fetchAndRenderReport();
}
function initializeFinancialReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#financial-report-table-body');
    const filterForm = container.querySelector('#financial-report-filter-form');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');
    const summaryCollections = container.querySelector('#summary-collections');
    const summaryPayments = container.querySelector('#summary-payments');

    async function fetchAndRenderReport(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const apiUrl = `${API_BASE_URL}/api/reports/financial-transactions?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            const transactions = await response.json();
            
            let totalCollections = 0;
            let totalPayments = 0;

            if (!transactions || transactions.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Kriterlere uygun kayıt bulunamadı.</td></tr>`;
            } else {
                 tableBody.innerHTML = transactions.map(t => {
                    const isCollection = t.transactionType === 'Tahsilat';
                    if (isCollection) totalCollections += t.amount;
                    else totalPayments += t.amount;
                    return `
                        <tr>
                            <td>${new Date(t.transactionDate).toLocaleDateString('tr-TR')}</td>
                            <td><span class="badge ${isCollection ? 'bg-success' : 'bg-danger'}">${t.transactionType}</span></td>
                            <td>${t.cariName}</td>
                            <td>${t.relatedInvoiceNumber || '-'}</td>
                            <td class="text-end fw-bold">${t.amount.toFixed(2)} ₺</td>
                        </tr>`;
                }).join('');
            }
            summaryCollections.textContent = `${totalCollections.toFixed(2)} ₺`;
            summaryPayments.textContent = `${totalPayments.toFixed(2)} ₺`;
        } catch (error) { alert("Bir Hata Oluştu.") }
    }

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAndRenderReport({ startDate: startDateInput.value, endDate: endDateInput.value });
    });

    fetchAndRenderReport();
}

function initializeProductSalesReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#product-sales-report-table-body');
    const filterForm = container.querySelector('#product-sales-filter-form');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');
    
    const docModal = new bootstrap.Modal(document.getElementById('documentDetailModal'));
    const docModalTitle = document.getElementById('documentModalTitle');
    const docModalContent = document.getElementById('documentModalContent');

    async function fetchAndRenderReport(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const apiUrl = `${API_BASE_URL}/api/reports/product-sales?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            const reportData = await response.json();
            
            if (!reportData || reportData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Kriterlere uygun satış kaydı bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = reportData.map(item => `
                <tr>
                    <td><strong>${item.sku}</strong></td>
                    <td>${item.productName}</td>
                    <td class="text-center fw-bold">${item.totalQuantitySold}</td>
                    <td class="text-end fw-bold">${item.totalRevenue.toFixed(2)} ₺</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary details-btn" 
                                data-product-id="${item.productId}" 
                                data-product-name="${item.productName}">
                            <i class="fas fa-chart-line"></i> Detay
                        </button>
                    </td>
                </tr>`).join('');
        } catch (error) { 
            console.error("Rapor verisi yüklenemedi veya çizilemedi:", error);
            const ctx = chartCanvas.getContext('2d');
            ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText("Rapor verileri yüklenirken bir hata oluştu. Lütfen konsolu kontrol edin.", 10, 50);
         }
    }


    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAndRenderReport({ startDate: startDateInput.value, endDate: endDateInput.value });
    });

    tableBody.addEventListener('click', async (e) => {
        const detailsBtn = e.target.closest('.details-btn');
        if (!detailsBtn) return;

        const productId = detailsBtn.dataset.productId;
        const productName = detailsBtn.dataset.productName;
        const filters = { startDate: startDateInput.value, endDate: endDateInput.value };
        
        docModalTitle.textContent = `'${productName}' Aylık Satış Dökümü`;
        docModalContent.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
        docModal.show();
        
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const detailUrl = `${API_BASE_URL}/api/reports/product-sales/${productId}?${params.toString()}`;
        try {
            const response = await fetch(detailUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            const monthlyData = await response.json();
            
            if (!monthlyData || monthlyData.length === 0) {
                docModalContent.innerHTML = `<p class="text-center p-4">Bu ürün için seçilen tarih aralığında satış hareketi bulunmuyor.</p>`;
                return;
            }

            const itemsHtml = monthlyData.map(m => `
                <tr>
                    <td>${m.month}</td>
                    <td class="text-center">${m.quantitySold}</td>
                    <td class="text-end">${m.revenue.toFixed(2)} ₺</td>
                </tr>`).join('');
            
            docModalContent.innerHTML = `
                <table class="table table-sm table-striped">
                    <thead class="table-light"><tr><th>Ay</th><th class="text-center">Satış Adedi</th><th class="text-end">Ciro</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>`;
        } catch (error) { 
            console.error("Rapor verisi yüklenemedi veya çizilemedi:", error);
            const ctx = chartCanvas.getContext('2d');
            ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText("Rapor verileri yüklenirken bir hata oluştu. Lütfen konsolu kontrol edin.", 10, 50);
        }
    });

    fetchAndRenderReport();
}

function initializeCustomerSalesReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#customer-sales-report-table-body');
    const filterForm = container.querySelector('#customer-sales-filter-form');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');
    const customerInput = container.querySelector('#filter-customer'); // YENİ EKLENDİ
    
    async function fetchAndRenderReport(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.customerSearch) params.append('customerSearch', filters.customerSearch); // YENİ EKLENDİ
        
        const apiUrl = `${API_BASE_URL}/api/reports/customer-sales?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Rapor verileri yüklenemedi.");
            const reportData = await response.json();
            
            if (!reportData || reportData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4">Kriterlere uygun satış kaydı bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = reportData.map(item => `
                <tr>
                    <td><strong>${item.customerName}</strong></td>
                    <td class="text-center">${item.totalInvoiceCount}</td>
                    <td class="text-center">${new Date(item.lastPurchaseDate).toLocaleDateString('tr-TR')}</td>
                    <td class="text-end fw-bold">${item.totalSalesAmount.toFixed(2)} ₺</td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAndRenderReport({ startDate: startDateInput.value, endDate: endDateInput.value,customerSearch: customerInput.value});
    });

    fetchAndRenderReport(); 
}
function initializeProfitabilityReportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const tableBody = container.querySelector('#profitability-report-table-body');
    const filterForm = container.querySelector('#profitability-filter-form');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');
    
    async function fetchAndRenderReport(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-5"><div class="spinner-border"></div></td></tr>`;
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const apiUrl = `${API_BASE_URL}/api/reports/product-profitability?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            const reportData = await response.json();
            
            if (!reportData || reportData.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4">Kriterlere uygun kayıt bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = reportData.map(item => {
                let marginClass = 'text-dark';
                if (item.profitMargin > 25) marginClass = 'text-success',style="color:green";
                else if (item.profitMargin < 10 && item.profitMargin > 0) marginClass = 'text-warning';
                else if (item.profitMargin <= 0) marginClass = 'text-danger';

                return `
                    <tr>
                        <td><strong>${item.sku}</strong></td>
                        <td>${item.productName}</td>
                        <td class="text-center">${item.totalQuantitySold}</td>
                        <td class="text-end">${item.totalRevenue.toFixed(2)} ₺</td>
                        <td class="text-end">${item.totalCost.toFixed(2)} ₺</td>
                        <td class="text-end fw-bold">${item.totalProfit.toFixed(2)} ₺</td>
                        <td class="text-center fw-bold ${marginClass}">% ${item.profitMargin.toFixed(2)}</td>
                    </tr>`;
            }).join('');
        } catch (error) {  }
    }

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAndRenderReport({ startDate: startDateInput.value, endDate: endDateInput.value });
    });

    fetchAndRenderReport();
}


function initializeCariActivitiesPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

   
    const tableBody = container.querySelector('#cari-activities-table-body');
    const filterForm = container.querySelector('#cari-activities-filter-form');
    const cariInput = container.querySelector('#filter-cari');
    const typeInput = container.querySelector('#filter-type');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');

    if (!filterForm) {
        console.error("KRİTİK HATA: '#cari-activities-filter-form' ID'li form bulunamadı. Yüklenen HTML doğru mu?");
        return; 
    }
    if (!tableBody) {
        console.error("KRİTİK HATA: '#cari-activities-table-body' ID'li tablo gövdesi bulunamadı.");
        return;
    }

    async function fetchAndRender(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        const params = new URLSearchParams();
        if (filters.cariSearch) params.append('cariSearch', filters.cariSearch);
        if (filters.transactionType) params.append('transactionType', filters.transactionType);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        const apiUrl = `${API_BASE_URL}/api/financialtransactions?${params.toString()}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Cari hareketleri yüklenemedi.');
            const transactions = await response.json();
            if (!transactions || transactions.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Seçilen kriterlere uygun bir hareket bulunamadı.</td></tr>`;
                return;
            }
            tableBody.innerHTML = transactions.map(t => {
                const isCollection = t.transactionType === 'Tahsilat';
                return `<tr>
                    <td>${new Date(t.transactionDate).toLocaleDateString('tr-TR')}</td>
                    <td>${t.cariName}</td>
                    <td><span class="badge ${isCollection ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}">${t.transactionType}</span></td>
                    <td>${t.description || '-'}</td>
                    <td>${t.relatedInvoiceNumber || '-'}</td>
                    <td>${t.relatedOrderNumber || '-'}</td> <td class="text-end fw-bold">${t.amount.toFixed(2)} ₺</td>
                </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const filters = {
            cariSearch: cariInput.value,
            transactionType: typeInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };
        fetchAndRender(filters);
    });


    fetchAndRender();
}
function initializeOrderActivitiesPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }
    const tableBody = container.querySelector('#order-activities-table-body');
    const filterForm = container.querySelector('#order-activities-filter-form');
    const docNumberInput = container.querySelector('#filter-doc-number');
    const activityTypeInput = container.querySelector('#filter-activity-type');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');

    if (!tableBody || !filterForm) {
        console.error("Sipariş Hareketleri sayfasındaki form veya tablo bulunamadı.");
        return;
    }

    async function fetchAndRender(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;

        const params = new URLSearchParams();
        if (filters.docNumberSearch) params.append('docNumberSearch', filters.docNumberSearch);
        if (filters.activityType) params.append('activityType', filters.activityType);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);

        const apiUrl = `${API_BASE_URL}/api/reports/order-activities?${params.toString()}`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Sipariş hareketleri yüklenemedi.');
            const activities = await response.json();

            if (!activities || activities.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Seçilen kriterlere uygun bir sipariş hareketi bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = activities.map(item => {
                const isSale = item.activityType === 'Satış Siparişi';
                let statusClass = 'bg-secondary';
                if (item.status.includes('Onaylandı') || item.status.includes('Teslim')) statusClass = 'bg-success';
                if (item.status.includes('Bekliyor')) statusClass = 'bg-warning';
                if (item.status.includes('Gönderildi')) statusClass = 'bg-info';
                if (item.status.includes('İptal')) statusClass = 'bg-danger';

                return `
                    <tr>
                        <td>${new Date(item.documentDate).toLocaleDateString('tr-TR')}</td>
                        <td>
                            <span class="badge ${isSale ? 'bg-primary' : 'bg-warning'}">${item.activityType}</span>
                        </td>
                        <td><strong>${item.documentNumber}</strong></td>
                        <td>${item.cariName}</td>
                        <td class="text-center">
                            <span class="badge ${statusClass}">${item.status}</span>
                        </td>
                        <td class="text-end fw-bold">${item.totalAmount.toFixed(2)} ₺</td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const filters = {
            docNumberSearch: docNumberInput.value,
            activityType: activityTypeInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };
        fetchAndRender(filters);
    });

    fetchAndRender();
}
function initializeCashBankAccountsPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

 
    const tableBody = container.querySelector('#accounts-table-body');
    const form = container.querySelector('#new-account-form');
    const nameInput = container.querySelector('#account-name');
    const typeInput = container.querySelector('#account-type');
    const currencyInput = container.querySelector('#account-currency');
    const ibanInput = container.querySelector('#account-iban');
    const saveButton = form.querySelector('button[type="submit"]');


    if (!tableBody || !form || !nameInput || !typeInput || !currencyInput) {
        console.error("Kasa/Banka Tanımları sayfasındaki temel HTML elemanlarından biri bulunamadı. Lütfen HTML dosyasını ve ID'leri kontrol edin.");
        return;
    }

  
    async function fetchAndRenderAccounts() {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4"><div class="spinner-border spinner-border-sm"></div></td></tr>`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/cashandbankaccounts`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Hesaplar yüklenemedi.');
            const accounts = await response.json();

            if (!accounts || accounts.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4">Henüz hiç hesap tanımlanmamış.</td></tr>`;
                return;
            }

            tableBody.innerHTML = accounts.map(acc => `
                <tr>
                    <td><strong>${acc.name}</strong></td>
                    <td>${acc.accountType}</td>
                    <td>${acc.currency}</td>
                    <td>${acc.iban || '-'}</td>
                </tr>`).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }

  
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newAccountData = {
            name: nameInput.value,
            accountType: typeInput.value,
            currency: currencyInput.value,
            iban: ibanInput.value,
            initialBalance: 0 
        };

        saveButton.disabled = true;
        saveButton.textContent = 'Kaydediliyor...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/cashandbankaccounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newAccountData)
            });

            if (!response.ok) {
                const errorResult = await response.json();
                const errorMessages = Object.values(errorResult.errors || {}).flat().join('\n');
                throw new Error(errorMessages || 'Hesap oluşturulamadı.');
            }
            
            form.reset(); 
            currencyInput.value = 'TRY'; 
            await fetchAndRenderAccounts(); 

        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Hesabı Kaydet';
        }
    });
    fetchAndRenderAccounts();
}


function initializeAccountStatementPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const accountSelect = container.querySelector('#account-select-filter');
    const tableBody = container.querySelector('#account-statement-table-body');
    const balanceEl = container.querySelector('#current-balance');

    if (!accountSelect || !tableBody || !balanceEl) {
        console.error("Kasa Hareketleri sayfası için gerekli HTML elemanlarından biri bulunamadı.");
        return;
    }

    let accountsData = []; 
    const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

    
    async function fetchAndRenderStatement(accountId) {
        if (!accountId) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Lütfen bir hesap seçin.</td></tr>`;
            balanceEl.textContent = currencyFormatter.format(0);
            return;
        }

        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        balanceEl.textContent = '...';
        
        const selectedAccount = accountsData.find(acc => acc.id == accountId);
        const initialBalance = selectedAccount ? selectedAccount.initialBalance : 0;
        let runningBalance = initialBalance;

        const apiUrl = `${API_BASE_URL}/api/financialtransactions?accountId=${accountId}`;
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Hesap hareketleri yüklenemedi.');
            const transactions = await response.json();

            if (!transactions || transactions.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Bu hesapta hiç hareket bulunmuyor.</td></tr>`;
                balanceEl.textContent = currencyFormatter.format(initialBalance);
                return;
            }

            tableBody.innerHTML = transactions.map(t => {
                
                
                let inflow = 0;
                let outflow = 0;
                 if (t.transactionType === 'Tahsilat' || t.transactionType === 'Virman Giriş') {
                    inflow = t.amount;
                } else { 
                    outflow = t.amount;
                }

                runningBalance += inflow - outflow; 

                return `
                    <tr>
                        <td>${new Date(t.transactionDate).toLocaleDateString('tr-TR')}</td>
                        <td>${t.description || '-'}</td>
                        <td>${t.cariName}</td>
                        <td class="text-end text-success">${inflow > 0 ? currencyFormatter.format(inflow) : '-'}</td>
                        <td class="text-end text-danger">${outflow > 0 ? currencyFormatter.format(outflow) : '-'}</td>
                        <td class="text-end fw-bold">${currencyFormatter.format(runningBalance)}</td>
                    </tr>`;
            }).join('');
            
            // Son bakiye en üste de yazılır
            balanceEl.textContent = currencyFormatter.format(runningBalance);

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center p-4">${error.message}</td></tr>`;
            balanceEl.textContent = 'Hata!';
        }
    }
    async function populateAccounts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cashandbankaccounts`, { headers: { 'Authorization': `Bearer ${token}` } });
            accountsData = await response.json(); 
            
            accountSelect.innerHTML = '<option value="" disabled selected>Bir hesap seçin...</option>';
            accountsData.forEach(acc => {
                accountSelect.innerHTML += `<option value="${acc.id}">${acc.name} (${acc.currency})</option>`;
            });
        } catch (error) {
            accountSelect.innerHTML = '<option value="" disabled>Hesaplar yüklenemedi</option>';
        }
    }
    accountSelect.addEventListener('change', () => {
        const selectedAccountId = accountSelect.value;
        fetchAndRenderStatement(selectedAccountId);
    });

    populateAccounts();
}

function initializeAccountTransferPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const form = container.querySelector('#account-transfer-form');
    const sourceAccountSelect = container.querySelector('#source-account-select');
    const destAccountSelect = container.querySelector('#destination-account-select');
    const dateInput = container.querySelector('#transfer-date');
    const amountInput = container.querySelector('#transfer-amount');
    const descriptionInput = container.querySelector('#transfer-description');
    const saveButton = form.querySelector('button[type="submit"]');

    if (!form || !sourceAccountSelect || !destAccountSelect || !dateInput || !amountInput) {
        console.error("Hesaplar Arası Virman sayfasındaki temel HTML elemanlarından biri bulunamadı.");
        return;
    }

    async function populateAccounts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cashandbankaccounts`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Hesaplar yüklenemedi.');
            
            const accounts = await response.json();
            const options = accounts.map(acc => `<option value="${acc.id}">${acc.name} (${acc.currency})</option>`).join('');

            sourceAccountSelect.innerHTML = '<option value="" disabled selected>Bir kaynak hesap seçin...</option>' + options;
            destAccountSelect.innerHTML = '<option value="" disabled selected>Bir hedef hesap seçin...</option>' + options;

        } catch (error) {
            sourceAccountSelect.innerHTML = `<option value="" disabled>${error.message}</option>`;
            destAccountSelect.innerHTML = `<option value="" disabled>${error.message}</option>`;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const transferData = {
            sourceAccountId: parseInt(sourceAccountSelect.value),
            destinationAccountId: parseInt(destAccountSelect.value),
            amount: parseFloat(amountInput.value),
            transactionDate: dateInput.value,
            description: descriptionInput.value
        };

        if (!transferData.sourceAccountId || !transferData.destinationAccountId || !transferData.amount || !transferData.transactionDate) {
            alert('Lütfen tüm zorunlu (*) alanları doldurun.');
            return;
        }
        if (transferData.sourceAccountId === transferData.destinationAccountId) {
            alert("Kaynak ve hedef hesap aynı olamaz.");
            return;
        }
        if (transferData.amount <= 0) {
            alert("Tutar 0'dan büyük olmalıdır.");
            return;
        }

        saveButton.disabled = true;
        saveButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> İşleniyor...`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/financialtransactions/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(transferData)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Transfer gerçekleştirilemedi.');
            }

            window.showSuccessModal(result.message);
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0]; // Tarihi tekrar bugüne ayarla
            
        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = `<i class="fas fa-exchange-alt me-2"></i>Virmanı Gerçekleştir`;
        }
    });

    dateInput.value = new Date().toISOString().split('T')[0]; 
    populateAccounts(); 
}

function initializeAuditLogPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

  
    const tableBody = container.querySelector('#audit-log-table-body');
    const filterForm = container.querySelector('#audit-log-filter-form');
    const userInput = container.querySelector('#filter-user-search');
    const actionTypeInput = container.querySelector('#filter-action-type');
    const startDateInput = container.querySelector('#filter-start-date');
    const endDateInput = container.querySelector('#filter-end-date');

    if (!filterForm || !tableBody) {
        console.error("İşlem Kayıtları sayfasındaki temel HTML elemanlarından biri bulunamadı.");
        return;
    }

    function formatChanges(changesJson) {
        try {
            const changes = JSON.parse(changesJson);
            return changes.filter(c => c.CurrentValue !== null)
                .map(c => `<div><strong>${c.Name}:</strong> ${JSON.stringify(c.CurrentValue)}</div>`)
                .join('');
        } catch (e) {
            return changesJson; 
        }
    }
    async function fetchAndRenderLogs(filters = {}) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5"><div class="spinner-border text-primary"></div></td></tr>`;
        
        const params = new URLSearchParams();
        if (filters.userSearch) params.append('userSearch', filters.userSearch);
        if (filters.actionType) params.append('actionType', filters.actionType);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const apiUrl = `${API_BASE_URL}/api/auditlogs?${params.toString()}`;

        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('İşlem kayıtları yüklenemedi.');
            const logs = await response.json();

            if (!logs || logs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">Seçilen kriterlere uygun bir işlem kaydı bulunamadı.</td></tr>`;
                return;
            }

            tableBody.innerHTML = logs.map(log => {
                let actionBadge = 'bg-secondary';
                if (log.actionType === 'Added') actionBadge = 'bg-success';
                if (log.actionType === 'Modified') actionBadge = 'bg-primary';
                if (log.actionType === 'Deleted') actionBadge = 'bg-danger';

                return `
                    <tr>
                        <td>${new Date(log.timestamp).toLocaleString('tr-TR',{ dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>${log.username}</td>
                        <td><span class="badge ${actionBadge}">${log.actionType}</span></td>
                        <td>${log.tableName}</td>
                        <td>${log.recordId}</td>
                        <td class="changes-cell">${formatChanges(log.changes)}</td>
                    </tr>`;
            }).join('');
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center p-4">${error.message}</td></tr>`;
        }
    }
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const filters = {
            userSearch: userInput.value,
            actionType: actionTypeInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };
        fetchAndRenderLogs(filters);
    });

    fetchAndRenderLogs();
}
function initializeSettingsPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const profileForm = container.querySelector('#profile-settings-form');
    const usernameInput = container.querySelector('#profile-username');
    const emailInput = container.querySelector('#profile-email');
    const profileSaveButton = profileForm.querySelector('button[type="submit"]');

    const passwordForm = container.querySelector('#password-change-form');
    const currentPasswordInput = container.querySelector('#current-password');
    const newPasswordInput = container.querySelector('#new-password');

    const companyProfileForm = container.querySelector('#company-profile-form');
    const companyNameInput = container.querySelector('#company-name');
    const taxOfficeInput = container.querySelector('#company-tax-office');
    const taxNumberInput = container.querySelector('#company-tax-number');
    const addressInput = container.querySelector('#company-address');

    

    async function loadUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
            const user = await response.json();
            usernameInput.value = user.username;
            emailInput.value = user.email;
        } catch (error) { console.error("Profil bilgileri yüklenemedi:", error); }
    }
    async function loadCompanyProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/companyprofile`, { headers: { 'Authorization': `Bearer ${token}` } });
            const profile = await response.json();
            
            if (profile) {
                companyNameInput.value = profile.companyName || '';
                taxOfficeInput.value = profile.taxOffice || '';
                taxNumberInput.value = profile.taxNumber || '';
                addressInput.value = profile.address || '';
            }
        } catch (error) {
            console.error("Firma profili bilgileri yüklenemedi:", error);
        }
    }
    
    // Profil güncelleme formu
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            username: usernameInput.value,
            email: emailInput.value
        };

        profileSaveButton.disabled = true;
        profileSaveButton.textContent = "Güncelleniyor...";

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            window.showSuccessModal(result.message);
        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            profileSaveButton.disabled = false;
            profileSaveButton.textContent = "Bilgileri Güncelle";
        }
    });

    companyProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveButton = companyProfileForm.querySelector('button[type="submit"]');

        const data = {
            companyName: companyNameInput.value,
            taxOffice: taxOfficeInput.value,
            taxNumber: taxNumberInput.value,
            address: addressInput.value,
        };

        saveButton.disabled = true;
        saveButton.textContent = "Kaydediliyor...";

        try {
            const response = await fetch(`${API_BASE_URL}/api/companyprofile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            window.showSuccessModal(result.message);
        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Firma Bilgilerini Kaydet";
        }
    });
    
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            currentPassword: currentPasswordInput.value,
            newPassword: newPasswordInput.value
        };
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            window.showSuccessModal(result.message);
            passwordForm.reset();
        } catch (error) { alert(`Hata: ${error.message}`); }
    });

    

    loadUserProfile();
    loadCompanyProfile();
}
function initializeSupportPage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const form = container.querySelector('#support-ticket-form');
    const subjectInput = container.querySelector('#ticket-subject');
    const bodyInput = container.querySelector('#ticket-body');
    const attachmentInput = container.querySelector('#ticket-attachment');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('Subject', subjectInput.value);
        formData.append('Body', bodyInput.value);
        if (attachmentInput.files[0]) {
            formData.append('Attachment', attachmentInput.files[0]);
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Gönderiliyor...`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/support/send-ticket`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Talep gönderilemedi.');
            
            window.showSuccessModal(result.message);
            form.reset();
        } catch (error) {
            alert(`Hata: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-paper-plane me-2"></i>Destek Talebini Gönder`;
        }
    });
}
function initializeProfilePage(container) {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'invlogin.html'; return; }

    const cardUsername = container.querySelector('#profile-card-username');
    const cardRole = container.querySelector('#profile-card-role');
    const detailUsername = container.querySelector('#profile-detail-username');
    const detailEmail = container.querySelector('#profile-detail-email');
    const detailMemberSince = container.querySelector('#profile-detail-member-since');
    const goToSettingsBtn = container.querySelector('#go-to-settings-btn');
    const detailRole = container.querySelector('#profile-detail-role'); // YENİ
    const detailPackage = container.querySelector('#profile-detail-package');
    
    async function loadProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Profil bilgileri yüklenemedi.");
            const profile = await response.json();
     
            cardUsername.textContent = profile.username;
            cardRole.textContent = profile.role;
            detailUsername.textContent = profile.username;
            detailEmail.textContent = profile.email;
            detailRole.textContent = profile.role; 
            detailPackage.textContent = profile.subscriptionPackage;
            detailMemberSince.textContent = new Date(profile.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }
    
    goToSettingsBtn.addEventListener('click', () => {
        window.openTab('Ayarlar/ayarlar.html', 'Ayarlar');
    });

    loadProfile();
}

applyRoleBasedUI();




    window.openTab = async function (pageUrl, pageTitle) {
        const tabId = `tab-${pageUrl.replace(/[\/.]/g, '-')}`;
        const existingTabButton = document.querySelector(`.nav-link[data-bs-target="#${tabId}"]`);
        if (existingTabButton) { new bootstrap.Tab(existingTabButton).show(); return; }

        const tabButton = document.createElement("button");
        tabButton.className = "nav-link";
        tabButton.setAttribute("data-bs-toggle", "tab"); tabButton.setAttribute("data-bs-target", `#${tabId}`);
        tabButton.type = "button"; tabButton.setAttribute("role", "tab");
        tabButton.innerHTML = `${pageTitle} <button type="button" class="btn-close btn-close-sm ms-2" aria-label="Close"></button>`;
        
        const tabPane = document.createElement("div");
        tabPane.className = "tab-pane fade"; tabPane.id = tabId; tabPane.setAttribute("role", "tabpanel");
        tabPane.innerHTML = `<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div></div>`;
        
        const listItem = document.createElement("li"); listItem.className = "nav-item";
        listItem.appendChild(tabButton); tabNavigation.appendChild(listItem);
        tabContent.appendChild(tabPane);

        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`Sayfa yüklenemedi: ${pageUrl}`);
            const html = await response.text();
            tabPane.innerHTML = html;
            if (pageUrl === 'dashboard-summary') {
                const summaryTab = document.querySelector('[data-bs-target="#tab-ozet"]');
                if (summaryTab) new bootstrap.Tab(summaryTab).show();
                    return;

            }
            else if (pageUrl.includes("urun-listesi.html")) {
                initializeProductList(tabPane);
            }
            else if (pageUrl.includes("yeni-urun.html")) {
                initializeNewProductForm(tabPane); 
            }
            else if (pageUrl.includes("kategoriler.html")) { 
                   initializeCategoriesPage(tabPane);            
            }
            else if (pageUrl.includes("markalar.html")) { 
                    initializeBrandsPage(tabPane);
            }
            else if (pageUrl.includes("birimler.html")) { 
                   initializeUnitsPage(tabPane);
            }
            else if (pageUrl.includes("fiyat-listeleri.html")) { 
                   initializePriceListsPage(tabPane);
            }
            else if (pageUrl.includes("urun-islemleri.html")) { 
                   initializeProductEditPage(tabPane, pageUrl); 
             }
            else if (pageUrl.includes("satis-siparisleri.html")) {
                   initializeOrderListPage(tabPane);
            }
            else if (pageUrl.includes("yeni-satis-siparisi.html")) { 
                   initializeNewOrderPage(tabPane);
             }
            else if (pageUrl.includes("sevk-edilecekler.html")) { 
                 initializeShipmentsPage(tabPane);
             }
            else if (pageUrl.includes("satis-irsaliyeleri.html")) {
                  initializeWaybillsPage(tabPane);
             }
            else if (pageUrl.includes("satin-alma-siparisleri.html")) {
                  initializePurchaseOrderListPage(tabPane);
            }
             else if (pageUrl.includes("yeni-satin-alma.html")) {
                  initializeNewPurchaseOrderPage(tabPane);
             }
            else if (pageUrl.includes("satis-faturalari.html")) { 
                  initializeInvoicesPage(tabPane);
             }
            else if (pageUrl.includes("alis-irsaliyeleri.html")) { 
                  initializePurchaseWaybillsPage(tabPane);
            } 
            else if (pageUrl.includes("alis-faturalari.html")) { 
               initializePurchaseInvoicesPage(tabPane);
            }
            else if (pageUrl.includes("cari-listesi.html")) { 
              initializeCariListPage(tabPane);
            }  
            else if (pageUrl.includes("yeni-cari.html")) { 
              initializeNewCariPage(tabPane);
            }
            else if (pageUrl.includes("cari-duzenle.html")) { 
             initializeCariEditPage(tabPane, pageUrl);
            }
            else if (pageUrl.includes("cari-hareketleri.html")) { 
              initializeCariTransactionsPage(tabPane);
            }
            else if (pageUrl.includes("yeni-tahsilat.html")) { 
             initializeNewCollectionSlipPage(tabPane);
            }
            else if (pageUrl.includes("yeni-odeme.html")) { 
              initializeNewOdemePage(tabPane);
            } 
            else if (pageUrl.includes("borc-alacak-raporu.html")) { 
              initializeBorcAlacakReportPage(tabPane);
            }
            else if (pageUrl.includes("stok-durum-raporu.html")) { 
             initializeStockStatusReportPage(tabPane);
            }
            else if (pageUrl.includes("stok-hareketleri.html")) { 
              initializeStockMovementsPage(tabPane);
            }
            else if (pageUrl.includes("mal-kabul.html")) { 
              initializeGoodsReceiptPage(tabPane);
            }
            else if (pageUrl.includes("aylik-ciro-raporu.html")) { 
              initializeMonthlyTurnoverReportPage(tabPane);
            }
            else if (pageUrl.includes("urun-satis-raporu.html")) { 
               initializeProductSalesReportPage(tabPane);
            }
            else if (pageUrl.includes("tahsilat-odeme-raporu.html")) { 
               initializeFinancialReportPage(tabPane);
            }
            else if (pageUrl.includes("musteri-satis-raporu.html")) { 
               initializeCustomerSalesReportPage(tabPane);
            }
            else if (pageUrl.includes("karlilik-raporu.html")) { 
               initializeProfitabilityReportPage(tabPane);
            }
            else if (pageUrl.includes("cari-hareketleri2.html")) {
                initializeCariActivitiesPage(tabPane); 
            }
            else if (pageUrl.includes("siparis-hareketleri.html")) { 
                initializeOrderActivitiesPage(tabPane);
            }
            else if (pageUrl.includes("kasa-banka-tanimlari.html")) { 
               initializeCashBankAccountsPage(tabPane);
             }
             else if (pageUrl.includes("kasa-hareketleri.html")) { 
               initializeAccountStatementPage(tabPane);
            }
            else if (pageUrl.includes("hesaplar-arasi-virman.html")) { 
               initializeAccountTransferPage(tabPane);
            }
            else if (pageUrl.includes("islem-kayitlari.html")) { 
              initializeAuditLogPage(tabPane);
            }
            else if (pageUrl.includes("ayarlar.html")) { 
               initializeSettingsPage(tabPane);
            }
            else if (pageUrl.includes("destek.html")) { 
              initializeSupportPage(tabPane);
            }
            else if (pageUrl.includes("profilim.html")) {
               initializeProfilePage(tabPane);
            }
 

           
        }
            catch (error) {
            console.error("Sekme içeriği yüklenirken hata:", error);
            tabPane.innerHTML = `<div class="alert alert-danger m-4">Sayfa içeriği yüklenemedi.</div>`;
            }
              new bootstrap.Tab(tabButton).show();
              const closeButton = tabButton.querySelector('.btn-close');
              closeButton.addEventListener('click', (e) => {
              e.stopPropagation();
              const tabToRemove = document.getElementById(tabId);
              const buttonToRemove = tabButton.parentElement;
             if (tabButton.classList.contains('active')) {
                const prevButton = buttonToRemove.previousElementSibling?.querySelector('button') || document.querySelector('#tab-navigation button');
                if (prevButton) { new bootstrap.Tab(prevButton).show(); }
             }
             buttonToRemove.remove(); tabToRemove.remove();
        });
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", () => wrapper.classList.toggle("toggled"));
    }
   
    document.querySelectorAll(".sub-item").forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            const pageUrl = this.getAttribute("data-page");
            const pageTitle = this.getAttribute("data-title");
            
            if (pageUrl) {
                window.openTab(pageUrl, pageTitle);
            }
        });
    });
    initializeDashboardPage(document.getElementById('tab-ozet'));

    
    window.openTab = openTab;
});
