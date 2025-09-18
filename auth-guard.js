// auth-guard.js - GÜVENLİK GÖREVLİSİ

// Bu script, <head> etiketinin en başında olduğu için sayfanın geri kalanından önce çalışır.
const authToken = localStorage.getItem('authToken');

if (!authToken) {
    // Eğer tarayıcı hafızasunda token yoksa, bu sayfayı görmeye yetkisi yoktur.
    // Kullanıcıya haber ver ve hemen giriş sayfasına yönlendir.
    console.error("Auth Guard: Token bulunamadı! Giriş sayfasına yönlendiriliyor.");
    alert("Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.");
    window.location.href = 'invlogin.html'; 
}