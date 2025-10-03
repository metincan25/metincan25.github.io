const authToken = localStorage.getItem('authToken');
if (!authToken) {
    console.error("Auth Guard: Token bulunamadı! Giriş sayfasına yönlendiriliyor.");
    alert("Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.");
    window.location.href = 'invlogin.html'; 
}