# BAB III
## METODOLOGI PENELITIAN

### 3.1. Pengumpulan Data

Pengumpulan data merupakan tahapan yang dilakukan oleh peneliti untuk mencari informasi agar mendapatkan permasalahan yang akan menjadi topik dalam penelitian. Pada penelitian ini, pengumpulan data dilakukan dengan dua metode, yaitu observasi dan wawancara.

#### 3.1.1. Observasi

Observasi dilakukan dengan mendatangi langsung kantor Dinas Tenaga Kerja dan Transmigrasi (Disnakertrans) Kabupaten Lombok Tengah. Peneliti mengamati proses bisnis pelaporan data keberangkatan Calon Pekerja Migran Indonesia (CPMI) yang sedang berjalan. Dari hasil observasi, ditemukan bahwa proses pelaporan masih dilakukan secara manual melalui komunikasi satu arah seperti WhatsApp dan email, sehingga menyulitkan dalam hal monitoring, verifikasi, dan penyusunan laporan berkala. Data CPMI yang dilaporkan oleh perusahaan penempatan (PT) sering kali tidak terdokumentasi dengan baik karena tersebar di berbagai media komunikasi.

#### 3.1.2. Wawancara

Wawancara dilakukan dengan salah satu pegawai Disnakertrans Kabupaten Lombok Tengah yang bertanggung jawab pada bidang penempatan tenaga kerja. Wawancara bertujuan untuk memvalidasi permasalahan yang ditemukan saat observasi serta menggali kebutuhan sistem yang diharapkan. Dari hasil wawancara, diperoleh informasi bahwa pihak Disnakertrans membutuhkan sistem yang dapat menerima laporan data CPMI dari perusahaan penempatan secara digital, melakukan verifikasi status laporan, memonitoring jumlah keberangkatan, serta menyusun rekapitulasi laporan secara periodik.

#### 3.1.3. Hasil Analisis Masalah

Berdasarkan hasil observasi dan wawancara, dirumuskan analisis masalah menggunakan kerangka PIECES (Performance, Information, Economy, Control, Efficiency, Service) sebagai berikut:

**Tabel 3.1** Analisis Masalah dengan Kerangka PIECES

| No | Komponen | Masalah |
|---|---|---|
| 1 | **Performance** (Kinerja) | Proses pelaporan data CPMI dari perusahaan ke Disnakertrans masih menggunakan media WhatsApp dan email sehingga membutuhkan waktu yang lama untuk mengumpulkan dan merekap data. |
| 2 | **Information** (Informasi) | Informasi mengenai jumlah CPMI yang berangkat, status verifikasi, dan rekapitulasi data tidak tersedia secara real-time dan sulit diakses karena tersebar di berbagai media komunikasi. |
| 3 | **Economy** (Ekonomi) | Penggunaan media manual seperti cetak dokumen dan komunikasi berulang melalui telepon meningkatkan biaya operasional dalam proses pelaporan. |
| 4 | **Control** (Pengendalian) | Tidak adanya sistem yang terpusat menyebabkan sulitnya melakukan kontrol terhadap data laporan yang masuk, status verifikasi, dan histori perubahan data. |
| 5 | **Efficiency** (Efisiensi) | Pegawai Disnakertrans harus mereka ulang data dari berbagai sumber secara manual, sehingga proses rekapitulasi menjadi tidak efisien dan rentan terhadap kesalahan. |
| 6 | **Service** (Pelayanan) | Pelayanan kepada perusahaan penempatan dalam hal pelaporan dan monitoring status laporan masih lambat karena harus menunggu konfirmasi manual dari petugas. |

---

### 3.2. Analisis Masalah

Analisis masalah merupakan tahapan untuk mengidentifikasi dan merumuskan solusi dari permasalahan yang telah ditemukan. Berdasarkan hasil analisis PIECES pada Tabel 3.1, dirumuskan solusi berupa pengembangan **Sistem Informasi Pelaporan Data Pekerja Migran Indonesia (SIPEL)** berbasis web. Sistem ini akan mengintegrasikan seluruh proses pelaporan data CPMI mulai dari unggah laporan oleh perusahaan penempatan, verifikasi oleh admin Disnakertrans, monitoring dashboard, hingga rekapitulasi data secara periodik dalam satu platform terpusat.

**Tabel 3.2** Solusi Berdasarkan Analisis PIECES

| No | Komponen | Solusi |
|---|---|---|
| 1 | **Performance** | Sistem menyediakan platform digital yang memungkinkan perusahaan mengirim laporan secara langsung dan admin memverifikasi secara instan. |
| 2 | **Information** | Dashboard monitoring menyajikan informasi statistik dan rekapitulasi data secara real-time yang dapat diakses kapan saja. |
| 3 | **Economy** | Mengurangi biaya operasional dengan menghilangkan kebutuhan cetak dokumen dan komunikasi manual berulang. |
| 4 | **Control** | Sistem menyediakan autentikasi pengguna (JWT), role-based access control, dan log aktivitas untuk setiap transaksi. |
| 5 | **Efficiency** | Proses unggah laporan, verifikasi, dan rekap data dilakukan secara digital dalam satu sistem terintegrasi. |
| 6 | **Service** | Notifikasi otomatis dikirim ke pengguna terkait setiap perubahan status laporan, sehingga mempercepat alur informasi. |

---

### 3.3. Perancangan

Perancangan sistem dilakukan dengan menggunakan pendekatan terstruktur yang meliputi perancangan arsitektur sistem, perancangan basis data, perancangan diagram Unified Modeling Language (UML), dan perancangan antarmuka pengguna (User Interface).

#### 3.3.1. Arsitektur Sistem

Sistem dikembangkan menggunakan arsitektur **Client-Server 3-Tier** yang terdiri dari tiga lapisan:

1. **Presentation Layer (Frontend)** : Dibangun menggunakan Vue.js 3 dengan Composition API dan Pinia sebagai state management. Antarmuka pengguna diakses melalui web browser.
2. **Application Layer (Backend)** : Dibangun menggunakan Node.js dengan framework Express.js yang menyediakan REST API untuk melayani permintaan dari frontend.
3. **Data Layer (Database)** : Menggunakan MariaDB sebagai Database Management System (DBMS) untuk menyimpan seluruh data sistem.

Komunikasi antara frontend dan backend dilakukan melalui protokol HTTP dengan format data JSON. Autentikasi menggunakan JSON Web Token (JWT) dengan masa berlaku 24 jam. File upload (foto profil) dikelola menggunakan middleware Multer.

#### 3.3.2. Use Case Diagram

Use case diagram menggambarkan interaksi antara aktor dengan sistem. Terdapat dua aktor dalam sistem ini, yaitu:

1. **Admin Disnakertrans** : Memiliki akses penuh terhadap fitur dashboard monitoring, verifikasi laporan, data CPMI, rekapitulasi, manajemen perusahaan, log aktivitas, dan pengaturan profil.
2. **Perusahaan Penempatan (PT)** : Memiliki akses terhadap fitur dashboard PT, upload laporan, riwayat laporan, dan notifikasi.

![Use Case Diagram](Docs/screenshot_usecase.png)

**Gambar 3.1** Use Case Diagram Sistem Pelaporan Data PMI

#### 3.3.3. Activity Diagram

Activity diagram menggunakan alur kerja (workflow) pada fitur utama sistem, yaitu proses pelaporan data CPMI.

**Alur Pelaporan CPMI:**
1. Perusahaan (PT) login ke sistem
2. PT mengisi data laporan pada form upload (3 langkah: data laporan, upload file, konfirmasi)
3. Sistem menyimpan laporan dengan status "pending"
4. Sistem mencatat log aktivitas "Upload Laporan"
5. Sistem mengirim notifikasi ke admin
6. Admin login dan membuka halaman verifikasi
7. Admin melakukan review laporan
8. Admin memutuskan menerima atau menolak laporan
9. Sistem memperbarui status laporan
10. Sistem mencatat log aktivitas
11. Sistem mengirim notifikasi ke PT

#### 3.3.4. Entity Relationship Diagram (ERD)

ERD menggambarkan hubungan antar tabel dalam basis data sistem. Terdapat lima tabel utama yang saling berelasi:

1. **users** : Menyimpan data pengguna (admin dan PT)
2. **perusahaan** : Menyimpan data perusahaan penempatan
3. **laporan** : Menyimpan data laporan CPMI (berelasi dengan perusahaan)
4. **log_aktivitas** : Menyimpan catatan aktivitas pengguna (berelasi dengan users)
5. **notifikasi** : Menyimpan notifikasi untuk pengguna (berelasi dengan users)

![ERD](Docs/screenshot_erd.png)

**Gambar 3.2** Entity Relationship Diagram

#### 3.3.5. Perancangan Antarmuka (User Interface)

Perancangan antarmuka meliputi halaman-halaman berikut:

**A. Halaman Login**
Halaman yang digunakan oleh admin dan PT untuk masuk ke dalam sistem dengan memasukkan email dan password.

**B. Halaman Dashboard Admin**
Menampilkan empat kartu statistik (total laporan, menunggu verifikasi, diterima, ditolak), grafik batang laporan per periode, diagram lingkaran (donut chart) status laporan, dan tabel laporan terbaru.

**C. Halaman Verifikasi Laporan (Admin)**
Menampilkan daftar laporan yang masuk dengan fitur pencarian dan filter. Admin dapat melakukan review dan memutuskan menerima atau menolak laporan.

**D. Halaman Data CPMI (Admin)**
Menampilkan daftar nama CPMI yang telah dilaporkan, dilengkapi fitur pencarian, filter, paginasi, serta tombol export PDF dan CSV.

**E. Halaman Rekapitulasi (Admin)**
Menampilkan rekapitulasi data laporan berdasarkan periode dengan filter periode, perusahaan, dan negara tujuan serta fitur export CSV.

**F. Halaman Manajemen Perusahaan (Admin)**
Menampilkan daftar perusahaan dengan fitur tambah, edit, lihat detail, dan hapus perusahaan.

**G. Halaman Log Aktivitas (Admin)**
Menampilkan riwayat aktivitas pengguna dengan fitur pencarian, filter aksi, paginasi, serta tombol export PDF dan CSV.

**H. Halaman Dashboard PT**
Menampilkan welcome card, statistik laporan milik PT, notifikasi terbaru, dan tabel laporan terbaru.

**I. Halaman Upload Laporan (PT)**
Form multi-step (3 langkah) untuk mengunggah laporan data CPMI.

**J. Halaman Riwayat Laporan (PT)**
Menampilkan arsip laporan yang telah dikirim oleh PT.

#### 3.3.6. Perancangan Basis Data

Basis data dirancang dengan nama **sipel** yang terdiri dari lima tabel sebagai berikut:

**Tabel 3.3** Struktur Tabel users

| No | Kolom | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | INT(11) | Primary Key, Auto Increment |
| 2 | name | VARCHAR(100) | Nama pengguna |
| 3 | email | VARCHAR(100) | Alamat email (unik) |
| 4 | password | VARCHAR(255) | Password pengguna |
| 5 | role | ENUM('admin', 'pt') | Role pengguna |
| 6 | foto | VARCHAR(255) | Path foto profil (nullable) |

**Tabel 3.4** Struktur Tabel perusahaan

| No | Kolom | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | INT(11) | Primary Key, Auto Increment |
| 2 | nama | VARCHAR(100) | Nama perusahaan |
| 3 | alamat | TEXT | Alamat perusahaan |
| 4 | kontak | VARCHAR(50) | Nomor kontak |
| 5 | status | ENUM('aktif', 'nonaktif') | Status perusahaan |

**Tabel 3.5** Struktur Tabel laporan

| No | Kolom | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | INT(11) | Primary Key, Auto Increment |
| 2 | perusahaan_id | INT(11) | Foreign Key ke tabel perusahaan |
| 3 | perusahaan | VARCHAR(100) | Nama perusahaan |
| 4 | periode | VARCHAR(7) | Periode laporan (YYYY-MM) |
| 5 | jumlah | INT(11) | Jumlah CPMI |
| 6 | negara | VARCHAR(50) | Negara tujuan |
| 7 | file | VARCHAR(255) | Nama file upload |
| 8 | status | ENUM('pending', 'diterima', 'ditolak') | Status verifikasi |
| 9 | catatan | TEXT | Catatan verifikasi (nullable) |
| 10 | tgl_upload | DATETIME | Tanggal upload |
| 11 | tgl_konfirmasi | DATETIME | Tanggal konfirmasi (nullable) |

**Tabel 3.6** Struktur Tabel log_aktivitas

| No | Kolom | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | INT(11) | Primary Key, Auto Increment |
| 2 | user_id | INT(11) | Foreign Key ke tabel users |
| 3 | user_name | VARCHAR(100) | Nama pengguna |
| 4 | aksi | VARCHAR(50) | Jenis aksi |
| 5 | detail | TEXT | Detail aktivitas |
| 6 | waktu | DATETIME | Waktu aktivitas |

**Tabel 3.7** Struktur Tabel notifikasi

| No | Kolom | Tipe Data | Keterangan |
|---|---|---|---|
| 1 | id | INT(11) | Primary Key, Auto Increment |
| 2 | user_id | INT(11) | Foreign Key ke tabel users |
| 3 | title | VARCHAR(100) | Judul notifikasi |
| 4 | message | TEXT | Isi notifikasi |
| 5 | jenis | VARCHAR(50) | Jenis notifikasi |
| 6 | dibaca | TINYINT(1) | Status dibaca (0/1) |
| 7 | terkait_id | INT(11) | ID laporan terkait |
| 8 | dibuat | DATETIME | Waktu dibuat |

---

### 3.4. Implementasi

Implementasi merupakan tahapan peneliti menerjemahkan hasil perancangan ke dalam bentuk program aplikasi. Sistem dikembangkan menggunakan framework Vue.js untuk frontend dan Express.js untuk backend dengan database MariaDB.

#### 3.4.1. Implementasi Halaman Login

Halaman login merupakan pintu masuk bagi pengguna untuk mengakses sistem. Pengguna memasukkan email dan password, kemudian sistem akan memverifikasi dan mengarahkan ke halaman dashboard sesuai dengan role masing-masing.

![Halaman Login](Docs/screenshot_login.png)

**Gambar 3.3** Implementasi Halaman Login

#### 3.4.2. Implementasi Dashboard Admin

Dashboard admin menyajikan informasi statistik secara visual. Terdapat empat kartu statistik utama, grafik batang untuk melihat tren laporan per periode, dan diagram lingkaran untuk melihat proporsi status laporan.

![Dashboard Admin](Docs/screenshot_dashboard_admin.png)

**Gambar 3.4** Implementasi Dashboard Admin

#### 3.4.3. Implementasi Halaman Verifikasi Laporan

Halaman verifikasi menampilkan daftar laporan yang perlu diverifikasi oleh admin. Admin dapat melakukan review dan memutuskan menerima atau menolak laporan beserta catatan.

![Verifikasi Laporan](Docs/screenshot_verifikasi.png)

**Gambar 3.5** Implementasi Halaman Verifikasi Laporan

#### 3.4.4. Implementasi Halaman Upload Laporan (PT)

Halaman upload laporan menggunakan form multi-step dengan tiga langkah: pengisian data laporan, upload file, dan konfirmasi akhir sebelum submit.

![Upload Laporan](Docs/screenshot_upload.png)

**Gambar 3.6** Implementasi Halaman Upload Laporan

#### 3.4.5. Implementasi Halaman Data CPMI

Halaman Data CPMI menampilkan daftar nama CPMI yang telah dilaporkan. Data ditampilkan dalam bentuk tabel yang dilengkapi dengan fitur pencarian, filter berdasarkan status/negara/perusahaan, paginasi, serta tombol export PDF dan CSV.

![Data CPMI](Docs/screenshot_datacpmi.png)

**Gambar 3.7** Implementasi Halaman Data CPMI

#### 3.4.6. Implementasi Halaman Log Aktivitas

Halaman log aktivitas menampilkan riwayat seluruh aktivitas yang dilakukan pengguna dalam sistem. Data dapat difilter berdasarkan jenis aksi dan dicari menggunakan kata kunci. Tersedia juga fitur export PDF dan CSV serta paginasi untuk memudahkan navigasi data.

![Log Aktivitas](Docs/screenshot_log.png)

**Gambar 3.8** Implementasi Halaman Log Aktivitas

---

### 3.5. Testing

Testing merupakan tahapan pengujian terhadap aplikasi yang telah dikembangkan. Pengujian dilakukan dengan metode **Black-box Testing**, yaitu pengujian yang berfokus pada fungsionalitas sistem tanpa melihat struktur internal kode program. Pengujian dilakukan dengan menjalankan skenario-skenario yang merepresentasikan kebutuhan pengguna.

**Tabel 3.8** Hasil Black-box Testing

| No | Skenario | Langkah Pengujian | Hasil yang Diharapkan | Hasil |
|---|---|---|---|---|
| 1 | Login Admin | Masukkan email admin dan password yang benar | Redirect ke halaman dashboard admin | Valid |
| 2 | Login PT | Masukkan email PT dan password yang benar | Redirect ke halaman dashboard PT | Valid |
| 3 | Login Gagal | Masukkan email dan password salah | Menampilkan pesan error "Email atau password salah" | Valid |
| 4 | Upload Laporan (PT) | Isi form upload 3 langkah dan submit | Laporan tersimpan dengan status "pending", muncul notifikasi | Valid |
| 5 | Verifikasi Terima (Admin) | Klik review lalu pilih Terima | Status laporan berubah menjadi "diterima", PT mendapat notifikasi | Valid |
| 6 | Verifikasi Tolak (Admin) | Klik review lalu pilih Tolak + catatan | Status laporan berubah menjadi "ditolak", PT mendapat notifikasi | Valid |
| 7 | Tambah Perusahaan (Admin) | Isi form tambah perusahaan | Perusahaan baru muncul di daftar | Valid |
| 8 | Edit Perusahaan (Admin) | Ubah data perusahaan dan simpan | Data perusahaan berubah sesuai perubahan | Valid |
| 9 | Hapus Perusahaan (Admin) | Klik hapus pada perusahaan | Perusahaan terhapus dari daftar | Valid |
| 10 | Filter Data CPMI | Pilih filter status/negara/perusahaan | Tabel menampilkan data sesuai filter | Valid |
| 11 | Export PDF | Klik tombol Export PDF | File PDF terunduh dengan data yang sesuai | Valid |
| 12 | Export CSV | Klik tombol Export Excel | File CSV terunduh dengan data yang sesuai | Valid |
| 13 | Log Aktivitas | Lakukan aksi upload/verifikasi | Aktivitas tercatat di log dengan detail yang benar | Valid |
| 14 | Filter Log Aktivitas | Pilih filter aksi atau cari keyword | Log ditampilkan sesuai filter | Valid |
| 15 | Notifikasi | Verifikasi laporan oleh admin | PT menerima notifikasi status laporan | Valid |
| 16 | Akses Tanpa Login | Akses halaman dashboard tanpa token | Redirect ke halaman login | Valid |
| 17 | Akses Role Berbeda (PT) | PT coba akses halaman admin | Redirect ke dashboard PT | Valid |
| 18 | Akses Role Berbeda (Admin) | Admin coba akses halaman upload PT | Redirect ke dashboard admin | Valid |

Berdasarkan hasil pengujian black-box pada Tabel 3.8, seluruh skenario fungsional sistem berjalan sesuai dengan yang diharapkan. Sistem berhasil memenuhi kebutuhan pengguna yang telah dirumuskan pada tahap analisis. Semua fitur utama seperti login, upload laporan, verifikasi, manajemen perusahaan, data CPMI, rekap, log aktivitas, dan notifikasi telah berfungsi dengan baik. Sistem juga telah menerapkan mekanisme keamanan melalui autentikasi JWT dan pembatasan akses berdasarkan role pengguna.
