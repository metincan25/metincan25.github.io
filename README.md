# Inventra - Modern Mini ERP Çözümü

<p align="center">
  <img src="https://user-images.githubusercontent.com/username/repo/path/to/your/logo.png" alt="Inventra Logo" width="200"/>
</p>

<p align="center">
  <strong>İşinizi Kolaylaştıran Akıllı Çözümler</strong>
</p>

<p align="center">
  <a href="#english">English Version</a>
</p>

---

##  Türkçe Açıklama

**Inventra**, küçük ve orta ölçekli işletmelerin (KOBİ) temel operasyonel ihtiyaçlarını karşılamak üzere sıfırdan geliştirilmiş, modern ve web tabanlı bir mini ERP (Kurumsal Kaynak Planlama) çözümüdür. Bu proje, teorik yazılım geliştirme bilgisini, gerçek dünya problemlerine pratik ve entegre çözümler üreten bir ürüne dönüştürme amacıyla hayata geçirilmiştir.

Uygulama, siparişten stoğa, finanstan raporlamaya kadar tüm temel iş süreçlerini tek bir platformda birleştirerek, Excel tablolarının ve manuel veri girişinin neden olduğu karmaşıklığı ve hataları ortadan kaldırmayı hedefler.

### 🚀 Öne Çıkan Modüller ve Yetenekler

* **📈 Ana Sayfa (Dashboard):** Kullanıcıyı karşılayan, canlı tarih/saat bilgisi ve en sık kullanılan modüllere hızlı erişim linkleri sunan modern ve animasyonlu bir arayüz.
* **📦 Ürün ve Stok Yönetimi:** Ürün, kategori, marka ve birim tanımlama. Satış ve alım işlemleriyle otomatik olarak güncellenen anlık stok takibi.
* **🛒 Sipariş Yönetimi (Satış & Satın Alma):** Müşteri ve tedarikçi bazlı sipariş oluşturma, sipariş durumlarını (Onay Bekliyor, Onaylandı, Sevk Edildi vb.) yönetme ve iş akışını takip etme.
* **🚚 Sevkiyat ve Mal Kabul:** Satış siparişlerinden **Satış İrsaliyesi**, satın alma siparişlerinden ise **Alış İrsaliyesi** oluşturma. Bu işlemlerle stokların otomatik olarak güncellenmesi.
* **📄 Fatura Yönetimi:** İrsaliyelerden tek tıkla **Satış Faturası** ve **Alış Faturası** oluşturma, fatura durumlarını ("Ödenecek", "Ödendi") takip etme.
* **💰 Finans ve Cari Yönetimi:**
    * **Yeni Tahsilat/Ödeme Fişi:** Faturaları arayıp bularak fatura bazında tahsilat ve ödeme kaydı oluşturma.
    * **Cari Ekstresi:** Bir müşteri veya tedarikçiye ait tüm finansal geçmişi (faturalar, ödemeler, tahsilatlar) borç, alacak ve yürüyen bakiye formatında detaylı olarak görüntüleme.
    * **Kasa & Banka Hareketleri:** Tüm nakit akışını tek bir ekrandan takip etme.
* **📊 Raporlama:** Excel'e veri aktarma yeteneğine sahip, özelleştirilebilir raporlama ekranları.
* **🔒 Güvenlik:**
    * **JWT (JSON Web Token)** tabanlı kimlik doğrulama.
    * Rol bazlı yetkilendirme (Admin/User).
    * **İki Aşamalı Doğrulama (2FA):** E-posta ile gönderilen kod ile güvenli giriş.

### 🛠️ Kullanılan Teknolojiler

* **Backend:**
    * **C#** & **ASP.NET Core 8**: Güçlü, performanslı ve modern bir RESTful API altyapısı.
    * **Entity Framework Core**: Veritabanı işlemleri için ORM.
    * **MS SQL Server**: İlişkisel veritabanı.
    * **JWT (JSON Web Token)**: Kimlik doğrulama.
    * **Serilog**: Gelişmiş loglama.
    * **MailKit**: E-posta servisi.
    * **ClosedXML**: Excel'e veri aktarımı.
* **Frontend:**
    * **HTML5, CSS3, Saf JavaScript (ES6+)**: Herhangi bir framework'e bağımlı olmayan, temel ve güçlü bir arayüz.
    * **Bootstrap 5**: Duyarlı (Responsive) ve modern tasarım.
    * **Chart.js**: Grafiksel raporlamalar.
* **Güvenlik & Altyapı:**
    * **Cloudflare**: DDoS koruması ve CDN.

---
<br>

## <a name="english"></a>English Description

**Inventra** is a modern, web-based mini-ERP (Enterprise Resource Planning) solution, developed from scratch to meet the core operational needs of Small and Medium-sized Enterprises (SMEs). This project was brought to life with the goal of transforming theoretical software development knowledge into a product that provides practical and integrated solutions to real-world problems.

The application aims to eliminate the complexity and errors caused by Excel spreadsheets and manual data entry by consolidating all fundamental business processes—from orders to inventory, and from finance to reporting—into a single, unified platform.

### 🚀 Highlighted Modules & Capabilities

* **📈 Home Page (Dashboard):** A modern and animated interface that welcomes the user, displays live date/time, and provides quick access links to the most frequently used modules.
* **📦 Product & Inventory Management:** Define products, categories, brands, and units. Real-time inventory tracking that is automatically updated with sales and purchase transactions.
* **🛒 Order Management (Sales & Purchase):** Create customer and supplier-based orders, manage order statuses (Pending Approval, Approved, Shipped, etc.), and track the workflow.
* **🚚 Shipments & Goods Receipt:** Generate **Sales Waybills** from sales orders and **Purchase Waybills** from purchase orders, with automatic inventory updates.
* **📄 Invoice Management:** Create **Sales Invoices** and **Purchase Invoices** from waybills with a single click, and track invoice statuses ("Payable", "Paid").
* **💰 Finance & Account Management:**
    * **New Collection/Payment Slips:** Create collection and payment records on an invoice basis by searching for unpaid invoices.
    * **Account Statement:** View the complete financial history of a customer or supplier (invoices, payments, collections) in a detailed debit, credit, and running balance format.
    * **Cash & Bank Transactions:** Track all cash flow from a single screen.
* **📊 Reporting:** Customizable reporting screens with the ability to export data to Excel.
* **🔒 Security:**
    * **JWT (JSON Web Token)** based authentication.
    * Role-Based Authorization (Admin/User).
    * **Two-Factor Authentication (2FA):** Secure login with a code sent via email.
    * **reCAPTCHA:** Protection against bot attacks on registration pages.

### 🛠️ Technologies Used

* **Backend:**
    * **C#** & **ASP.NET Core 8**: A robust, high-performance, and modern RESTful API infrastructure.
    * **Entity Framework Core**: ORM for database operations.
    * **MS SQL Server**: Relational database.
    * **JWT (JSON Web Token)**: Authentication.
    * **Serilog**: Advanced logging.
    * **MailKit**: Email sending.
    * **ClosedXML**: Exporting data to Excel.
* **Frontend:**
    * **HTML5, CSS3, Vanilla JavaScript (ES6+)**: A powerful and fundamental UI without dependency on any specific framework.
    * **Bootstrap 5**: Responsive and modern design.
    * **Chart.js**: Graphical reporting.
* **Security & Infrastructure:**
    * **Cloudflare**: DDoS protection and CDN.
