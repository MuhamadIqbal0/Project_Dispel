-- ============================================================
-- Database: sipel (Sistem Informasi Penempatan Tenaga Kerja Luar Negeri)
-- Generate SQL untuk phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS sipel;
USE sipel;

-- -----------------------------------------------------------
-- Tabel: users
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','pt') NOT NULL DEFAULT 'pt'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin Dinas', 'admin@disnakertrans.go.id', 'admin123', 'admin'),
(2, 'PT. Bina Karya', 'pt.binakarya@mail.com', 'pt123', 'pt'),
(3, 'PT. Global Mandiri', 'pt.global@mail.com', 'pt123', 'pt');

-- -----------------------------------------------------------
-- Tabel: perusahaan
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS perusahaan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  alamat TEXT,
  kontak VARCHAR(50),
  status VARCHAR(10) DEFAULT 'aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO perusahaan (id, nama, alamat, kontak) VALUES
(2, 'PT. Bina Karya', 'Jl. Merdeka No. 123, Lombok Tengah', '087654321'),
(3, 'PT. Global Mandiri', 'Jl. Raya No. 45, Lombok Tengah', '087654322');

-- -----------------------------------------------------------
-- Tabel: laporan
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS laporan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  perusahaan_id INT NOT NULL,
  perusahaan VARCHAR(150) NOT NULL,
  periode VARCHAR(7) NOT NULL,
  jumlah INT NOT NULL DEFAULT 0,
  negara VARCHAR(100) NOT NULL,
  file VARCHAR(255) DEFAULT '',
  status ENUM('pending','diterima','ditolak') NOT NULL DEFAULT 'pending',
  catatan TEXT,
  tgl_upload DATETIME NOT NULL,
  tgl_konfirmasi DATETIME DEFAULT NULL,
  FOREIGN KEY (perusahaan_id) REFERENCES perusahaan(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO laporan (id, perusahaan_id, perusahaan, periode, jumlah, negara, file, status, catatan, tgl_upload, tgl_konfirmasi) VALUES
(1, 2, 'PT. Bina Karya', '2025-07', 25, 'Malaysia', 'laporan_jul2025.pdf', 'diterima', 'Data lengkap, valid.', '2025-08-01', '2025-08-03'),
(2, 2, 'PT. Bina Karya', '2026-01', 30, 'Taiwan', 'laporan_jan2026.pdf', 'diterima', 'Data lengkap dan valid.', '2026-02-01', '2026-06-24 04:03:02'),
(3, 3, 'PT. Global Mandiri', '2025-06', 15, 'Hong Kong', 'laporan_jun2025.pdf', 'diterima', 'Disetujui.', '2025-07-10', '2025-07-12'),
(4, 3, 'PT. Global Mandiri', '2025-12', 20, 'Korea Selatan', 'laporan_des2025.pdf', 'ditolak', 'Data tidak lengkap.', '2026-01-05', '2026-01-08');

-- -----------------------------------------------------------
-- Tabel: log_aktivitas
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_aktivitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  aksi VARCHAR(100) NOT NULL,
  detail TEXT,
  waktu DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO log_aktivitas (id, user_id, user_name, aksi, detail, waktu) VALUES
(1, 2, 'PT. Bina Karya', 'Upload Laporan', 'Upload laporan periode 2025-07 (25 CPMI ke Malaysia)', '2025-08-01'),
(2, 1, 'Admin Dinas', 'Konfirmasi Terima', 'Menerima laporan PT. Bina Karya - 2025-07', '2025-08-03'),
(3, 3, 'PT. Global Mandiri', 'Upload Laporan', 'Upload laporan periode 2025-06 (15 CPMI ke Hong Kong)', '2025-07-10'),
(4, 1, 'Admin Dinas', 'Konfirmasi Terima', 'Menerima laporan PT. Global Mandiri - 2025-06', '2025-07-12'),
(5, 3, 'PT. Global Mandiri', 'Upload Laporan', 'Upload laporan periode 2025-12 (20 CPMI ke Korea Selatan)', '2026-01-05'),
(6, 1, 'Admin Dinas', 'Konfirmasi Tolak', 'Menolak laporan PT. Global Mandiri - 2025-12. Catatan: Data tidak lengkap.', '2026-01-08'),
(7, 1, 'Admin Dinas', 'Konfirmasi Terima', 'Menerima laporan PT. Bina Karya - 2026-01. Catatan: Data lengkap dan valid.', '2026-06-24 04:03:02');

-- -----------------------------------------------------------
-- Tabel: notifikasi
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifikasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  jenis VARCHAR(50) DEFAULT NULL,
  dibaca TINYINT(1) NOT NULL DEFAULT 0,
  terkait_id INT DEFAULT NULL,
  dibuat DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO notifikasi (id, user_id, title, message, jenis, dibaca, terkait_id, dibuat) VALUES
(1, 2, 'Laporan Diterima', 'Laporan periode 2025-07 telah diterima oleh Admin Dinas.', 'diterima', 1, 1, '2025-08-03 10:00:00'),
(2, 3, 'Laporan Diterima', 'Laporan periode 2025-06 telah diterima oleh Admin Dinas.', 'diterima', 0, 3, '2025-07-12 10:00:00'),
(3, 3, 'Laporan Ditolak', 'Laporan periode 2025-12 ditolak. Catatan: Data tidak lengkap.', 'ditolak', 0, 4, '2026-01-08 10:00:00'),
(4, 2, 'Laporan Diterima', 'Laporan periode 2026-01 telah diterima oleh Admin Dinas.', 'diterima', 1, 2, '2026-06-24 04:03:02');
