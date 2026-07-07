<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useLaporanStore } from '../../stores/laporan'
import { useNotifikasiStore } from '../../stores/notifikasi'

const auth = useAuthStore()
const notif = useNotifikasiStore()
const store = useLaporanStore()
const stats = ref({ total: 0, pending: 0, diterima: 0, ditolak: 0 })

onMounted(async () => {
  await Promise.all([
    store.fetchLaporan(),
    store.fetchStats().then(s => stats.value = s),
    notif.fetchNotifications(),
  ])
})

const recent = computed(() => [...store.laporanList])

const acceptanceRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.diterima / stats.value.total) * 100)
})

const statCards = [
  {
    label: 'Total Laporan Dikirim',
    value: () => stats.value.total,
    variant: 'primary',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>',
    badge: '+12% Bulan ini',
    badgeClass: 'badge-growth',
  },
  {
    label: 'Laporan Diterima',
    value: () => stats.value.diterima,
    variant: 'success',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
    badge: () => `Tingkat Acc ${acceptanceRate.value}%`,
    badgeClass: 'badge-acceptance',
  },
  {
    label: 'Laporan Ditolak',
    value: () => stats.value.ditolak,
    variant: 'danger',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
    badge: 'Perlu Revisi',
    badgeClass: 'badge-revision',
  },
]

const statusLabel = (s) => {
  if (s === 'pending') return { text: 'Dalam Review', cls: 'badge-info' }
  if (s === 'diterima') return { text: 'Diterima', cls: 'badge-success' }
  if (s === 'ditolak') return { text: 'Ditolak', cls: 'badge-danger' }
  return { text: s, cls: 'badge-info' }
}
</script>

<template>
  <div>
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>Selamat Datang, {{ auth.user?.name }}</h2>
        <p>Pantau laporan data CPMI perusahaan Anda</p>
      </div>
    </div>

    <div class="alert-banner">
      <div class="alert-content">
        <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        <span>Periode pelaporan sedang berlangsung. Segera kirim laporan data CPMI Anda.</span>
      </div>
      <router-link to="/pt/upload" class="btn btn-warning" style="font-weight:600">Upload Sekarang</router-link>
    </div>

    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-icon" :class="card.variant" v-html="card.icon"></div>
        <div class="stat-info">
          <p class="stat-value">{{ card.value() }}</p>
          <p class="stat-label">{{ card.label }}</p>
          <span class="stat-badge" :class="card.badgeClass">
            {{ typeof card.badge === 'function' ? card.badge() : card.badge }}
          </span>
        </div>
      </div>
    </div>

    <div class="card notif-card" v-if="notif.notifications.length > 0" style="margin-top: 24px;">
      <div class="toolbar">
        <h3 class="section-title">Notifikasi Terbaru</h3>
        <router-link to="/pt/riwayat" class="btn btn-outline btn-sm">Lihat Semua</router-link>
      </div>
      <div class="notif-list-compact">
        <div v-for="n in notif.notifications.slice(0, 3)" :key="n.id" class="notif-row" :class="{ unread: !n.dibaca }">
          <span class="notif-badge-icon" :class="n.jenis === 'diterima' ? 'badge-success' : n.jenis === 'ditolak' ? 'badge-danger' : 'badge-warning'">
            {{ n.jenis === 'diterima' ? 'Diterima' : n.jenis === 'ditolak' ? 'Ditolak' : 'Pending' }}
          </span>
          <span class="notif-text">{{ n.message }}</span>
          <span class="notif-date">{{ n.dibuat }}</span>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="toolbar">
        <h3 class="section-title">Laporan Terbaru</h3>
        <router-link to="/pt/riwayat" class="btn btn-outline btn-sm">Lihat Semua</router-link>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Periode</th>
            <th>Jumlah CPMI</th>
            <th>Negara Tujuan</th>
            <th>Status</th>
            <th>Tgl Upload</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in recent" :key="l.id">
            <td><strong>{{ l.periode }}</strong></td>
            <td>{{ l.jumlah }} orang</td>
            <td>{{ l.negara }}</td>
            <td>
              <span class="badge" :class="statusLabel(l.status).cls">
                {{ statusLabel(l.status).text }}
              </span>
            </td>
            <td>{{ l.tgl_upload }}</td>
            <td>
              <router-link :to="'/pt/riwayat'" class="link-detail">Lihat Detail</router-link>
            </td>
          </tr>
          <tr v-if="recent.length === 0">
            <td colspan="6" class="empty-state">Belum ada laporan. Silakan upload laporan baru.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="help-card">
      <div class="help-content">
        <h4>Butuh Bantuan?</h4>
        <p>Jika Anda mengalami kesulitan, hubungi tim support kami</p>
      </div>
      <div class="help-actions">
        <a href="mailto:support@sipel.go.id" class="btn btn-success">Hubungi Support</a>
        <router-link to="/pt" class="btn btn-outline" style="color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.2);">Buka Panduan</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
  border-radius: var(--radius-lg); padding: 24px 28px; margin-bottom: 20px;
  color: white;
}
.welcome-text h2 { font-size: 20px; font-weight: 600; color: white; margin-bottom: 4px; }
.welcome-text p { font-size: 14px; color: rgba(255,255,255,0.7); }

.alert-banner {
  display: flex; align-items: center; justify-content: space-between;
  background: #fef3c7; border: 1px solid #f59e0b;
  border-radius: var(--radius-lg); padding: 14px 20px; margin-bottom: 20px;
  gap: 16px; flex-wrap: wrap;
}
.alert-content { display: flex; align-items: center; gap: 10px; color: #92400e; font-size: 14px; font-weight: 500; }
.alert-content svg { flex-shrink: 0; color: #f59e0b; }
.stat-card { align-items: flex-start; }
.stat-badge {
  display: inline-block; padding: 1px 8px; border-radius: 9999px;
  font-size: 11px; font-weight: 600; margin-top: 6px;
}
.badge-growth { background: #ecfdf5; color: #059669; }
.badge-acceptance { background: #ccfbf1; color: #0d9488; }
.badge-revision { background: #fef2f2; color: #dc2626; }

.link-detail { color: var(--gray-800); font-size: 13px; font-weight: 500; }
.link-detail:hover { color: var(--teal); text-decoration: none; }

.help-card {
  margin-top: 24px;
  background: #0a1f3f; border-radius: var(--radius-lg);
  padding: 28px 32px; display: flex; align-items: center;
  justify-content: space-between; gap: 20px; flex-wrap: wrap;
}
.help-content h4 { font-size: 16px; font-weight: 600; color: white; margin-bottom: 4px; }
.help-content p { font-size: 13px; color: rgba(255,255,255,0.5); }
.help-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.help-actions .btn-outline:hover { background: rgba(255,255,255,0.1); color: white; }

.notif-list-compact { display: flex; flex-direction: column; gap: 0; }
.notif-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--gray-100);
  flex-wrap: wrap;
}
.notif-row:last-child { border-bottom: none; }
.notif-row.unread { background: transparent; }
.notif-badge-icon { flex-shrink: 0; }
.notif-text { flex: 1; font-size: 13px; color: var(--gray-700); min-width: 200px; }
.notif-date { font-size: 11px; color: var(--gray-400); white-space: nowrap; }
</style>
