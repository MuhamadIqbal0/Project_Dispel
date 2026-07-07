<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'

const store = useLaporanStore()
const search = ref('')
const filterStatus = ref('')
const filterPerusahaan = ref('')
const filterPeriode = ref('')
const selectedLaporan = ref(null)
const keputusan = ref('diterima')
const catatan = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchLaporan(),
    store.fetchPerusahaan()
  ])
})

const uniquePeriode = computed(() => {
  const periods = store.laporanList.map(l => l.periode)
  return [...new Set(periods)].sort().reverse()
})

const filteredLaporan = computed(() => {
  let list = store.laporanList
  if (filterStatus.value) {
    list = list.filter(l => l.status === filterStatus.value)
  }
  if (filterPerusahaan.value) {
    list = list.filter(l => l.perusahaan === filterPerusahaan.value)
  }
  if (filterPeriode.value) {
    list = list.filter(l => l.periode === filterPeriode.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(l =>
      l.perusahaan?.toLowerCase().includes(q) ||
      l.periode?.toLowerCase().includes(q) ||
      l.negara?.toLowerCase().includes(q)
    )
  }
  return list
})

function openReview(laporan) {
  selectedLaporan.value = laporan
  keputusan.value = 'diterima'
  catatan.value = ''
  showModal.value = true
}

function openDetail(laporan) {
  selectedLaporan.value = laporan
  showDetailModal.value = true
}

async function konfirmasi() {
  if (!selectedLaporan.value) return
  await store.konfirmasiLaporan(selectedLaporan.value.id, keputusan.value, catatan.value)
  await store.fetchLaporan()
  showModal.value = false
  selectedLaporan.value = null
}

const statusTimeline = computed(() => {
  const l = selectedLaporan.value
  if (!l) return []
  const steps = [
    { label: 'Laporan Diterima Sistem', done: true, date: l.tgl_upload },
    { label: 'Verifikasi Data', done: l.status !== 'pending', date: l.status !== 'pending' ? l.tgl_konfirmasi : null },
    { label: 'Menunggu Verifikasi Manusia', done: false, active: l.status === 'pending', date: null },
    { label: 'Selesai', done: false, date: null },
  ]
  if (l.status === 'diterima') {
    steps[2].done = true
    steps[3].done = true
    steps[2].date = l.tgl_konfirmasi
    steps[3].date = l.tgl_konfirmasi
  }
  if (l.status === 'ditolak') {
    steps[2].done = true
    steps[2].date = l.tgl_konfirmasi
  }
  return steps
})
</script>

<template>
  <div>
    <h2 class="page-title">Laporan Masuk</h2>

    <div class="filter-bar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        <input v-model="search" class="form-input search-input" placeholder="Cari nama PT atau laporan..." />
      </div>
      <select v-model="filterPerusahaan" class="form-select" style="width: 180px;">
        <option value="">Semua Perusahaan</option>
        <option v-for="p in store.perusahaanList" :key="p.id" :value="p.nama">{{ p.nama }}</option>
      </select>
      <select v-model="filterPeriode" class="form-select" style="width: 140px;">
        <option value="">Semua Periode</option>
        <option v-for="periode in uniquePeriode" :key="periode" :value="periode">{{ periode }}</option>
      </select>
      <select v-model="filterStatus" class="form-select" style="width: 140px;">
        <option value="">Semua Status</option>
        <option value="pending">Menunggu</option>
        <option value="diterima">Diterima</option>
        <option value="ditolak">Ditolak</option>
      </select>
    </div>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Data Laporan</h3>
        <button class="btn btn-outline btn-sm" @click="() => {}">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          Export Excel
        </button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th>Nama PT</th>
            <th>Periode Laporan</th>
            <th>Negara Tujuan</th>
            <th>Tanggal Upload</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in filteredLaporan" :key="l.id">
            <td style="text-align: center;">{{ i + 1 }}</td>
            <td><strong>{{ l.perusahaan }}</strong></td>
            <td>{{ l.periode }}</td>
            <td>{{ l.negara }}</td>
            <td>{{ l.tgl_upload }}</td>
            <td>
              <span class="badge" :class="{
                'badge-warning': l.status === 'pending',
                'badge-success': l.status === 'diterima',
                'badge-danger': l.status === 'ditolak',
              }">
                {{ l.status === 'diterima' ? 'Diterima' : l.status === 'ditolak' ? 'Ditolak' : 'Pending' }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" @click="openReview(l)">Review</button>
                <button class="btn btn-outline btn-sm" @click="openDetail(l)">Detail</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredLaporan.length === 0">
            <td colspan="7" class="empty-state">Tidak ada laporan</td>
          </tr>
        </tbody>
      </table>

      <div class="info-banner">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        <span>Total {{ filteredLaporan.length }} laporan. Klik <strong>Review</strong> untuk melakukan verifikasi atau <strong>Detail</strong> untuk melihat informasi lengkap.</span>
      </div>
    </div>

    <div v-if="showModal && selectedLaporan" class="modal-overlay" @click="showModal = false">
      <div class="modal modal-wide" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Verifikasi Laporan</h3>
            <p class="modal-sub">{{ selectedLaporan.perusahaan }} — {{ selectedLaporan.periode }}</p>
          </div>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>

        <div class="modal-body-split">
          <div class="split-left">
            <h4 class="split-title">Dokumen Laporan</h4>
            <div class="doc-preview">
              <div class="pdf-icon">
                <svg viewBox="0 0 48 48" width="48" height="48"><rect x="8" y="4" width="32" height="40" rx="3" fill="#e5e7eb"/><rect x="12" y="8" width="24" height="4" rx="2" fill="#d1d5db"/><rect x="12" y="16" width="20" height="2" rx="1" fill="#d1d5db"/><rect x="12" y="22" width="22" height="2" rx="1" fill="#d1d5db"/><circle cx="36" cy="36" r="10" fill="#ef4444"/><text x="36" y="40" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="system-ui">PDF</text></svg>
              </div>
              <p class="doc-name">{{ selectedLaporan.file || 'Dokumen Tidak Tersedia' }}</p>
              <div class="doc-actions">
                <button class="btn btn-outline btn-sm">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.476 0-1.042.446-1.5 1.418-.326.693-.572 1.64-.694 2.582h4.388c-.122-.942-.368-1.889-.694-2.582C11.042 4.446 10.476 4 10 4zM3.939 12a6.005 6.005 0 004.095 4.456c.219-.464.414-1.008.567-1.619.186-.742.304-1.562.36-2.456H4.083c-.058.456-.1.927-.118 1.404.013.413.04.894.104 1.338.071.546.198 1.051.382 1.51.18.444.404.843.658 1.18A5.998 5.998 0 013.94 12zm6.118 4.856A5.995 5.995 0 0016.06 12h-1.946c-.089 1.546-.383 2.97-.837 4.118-.216.544-.48 1.015-.766 1.385.286-.37.55-.841.766-1.385-.12.303-.248.562-.377.777-.174.29-.366.502-.54.668a6.042 6.042 0 01-2.292 1.293zM8.53 12c.056.894.174 1.714.36 2.456.153.611.348 1.155.567 1.619A6.005 6.005 0 0013.06 12H8.53zm6.493-3h-1.946c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0116.06 9h-3.037z" clip-rule="evenodd"/></svg>
                  Buka Tab Baru
                </button>
                <button class="btn btn-outline btn-sm">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a1 1 0 00-1 1v8a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 3h6V5H7v2zm-1 4a1 1 0 011-1h1a1 1 0 010 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd"/></svg>
                  Cetak Dokumen
                </button>
              </div>
            </div>

            <h4 class="split-title" style="margin-top: 20px;">Riwayat Progress</h4>
            <div class="timeline">
              <div v-for="(step, i) in statusTimeline" :key="i" class="tl-item" :class="{ done: step.done, active: step.active }">
                <div class="tl-dot" :class="{ done: step.done, active: step.active }">
                  <svg v-if="step.done" viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
                <div class="tl-content">
                  <p class="tl-label">{{ step.label }}</p>
                  <p v-if="step.date" class="tl-date">{{ step.date }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="split-right">
            <h4 class="split-title">Keputusan Verifikasi</h4>
            <div class="form-group">
              <label>Catatan</label>
              <textarea v-model="catatan" class="form-textarea" placeholder="Tambahkan catatan untuk perusahaan..." rows="4"></textarea>
            </div>
            <div class="decision-actions">
              <button class="btn btn-success" @click="keputusan = 'diterima'; konfirmasi()">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                Terima Laporan
              </button>
              <button class="btn btn-outline btn-reject" @click="keputusan = 'ditolak'; konfirmasi()">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                Tolak Laporan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal && selectedLaporan" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Detail Laporan</h3>
            <p class="modal-sub">{{ selectedLaporan.perusahaan }} — {{ selectedLaporan.periode }}</p>
          </div>
          <button class="modal-close" @click="showDetailModal = false">&times;</button>
        </div>
        <table class="table detail-table">
          <tbody>
            <tr><td style="font-weight: 500; width: 140px;">Perusahaan</td><td>{{ selectedLaporan.perusahaan }}</td></tr>
            <tr><td style="font-weight: 500;">Periode</td><td>{{ selectedLaporan.periode }}</td></tr>
            <tr><td style="font-weight: 500;">Jumlah CPMI</td><td>{{ selectedLaporan.jumlah }} orang</td></tr>
            <tr><td style="font-weight: 500;">Negara Tujuan</td><td>{{ selectedLaporan.negara }}</td></tr>
            <tr><td style="font-weight: 500;">File</td><td><span class="file-badge">{{ selectedLaporan.file || '-' }}</span></td></tr>
            <tr><td style="font-weight: 500;">Status</td><td>
              <span class="badge" :class="{
                'badge-warning': selectedLaporan.status === 'pending',
                'badge-success': selectedLaporan.status === 'diterima',
                'badge-danger': selectedLaporan.status === 'ditolak',
              }">{{ selectedLaporan.status }}</span>
            </td></tr>
            <tr><td style="font-weight: 500;">Tgl Upload</td><td>{{ selectedLaporan.tgl_upload }}</td></tr>
            <tr><td style="font-weight: 500;">Tgl Konfirmasi</td><td>{{ selectedLaporan.tgl_konfirmasi || '-' }}</td></tr>
            <tr><td style="font-weight: 500;">Catatan</td><td style="color: var(--gray-500)">{{ selectedLaporan.catatan || '-' }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.section-title {
  font-size: 16px; font-weight: 600; color: var(--gray-800);
}
.filter-bar {
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
  margin-bottom: 20px; padding: 16px 20px;
  background: var(--white); border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 360px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.search-wrap .search-input { padding-left: 36px; }

.info-banner {
  display: flex; align-items: center; gap: 10px;
  margin-top: 20px; padding: 12px 16px;
  background: #ecfdf5; color: #065f46;
  border-radius: var(--radius); font-size: 13px;
}
.info-banner svg { flex-shrink: 0; color: #059669; }

.modal-wide { max-width: 800px; padding: 0; overflow: hidden; }
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px 0;
}
.modal-close {
  background: none; border: none; font-size: 28px; color: var(--gray-400);
  cursor: pointer; line-height: 1; padding: 0 4px;
}
.modal-close:hover { color: var(--gray-600); }

.modal-body-split {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  padding: 20px 28px 28px;
}
.split-left { padding-right: 24px; border-right: 1px solid var(--gray-200); }
.split-right { padding-left: 24px; }
.split-title { font-size: 14px; font-weight: 600; color: var(--gray-800); margin-bottom: 16px; }

.doc-preview {
  border: 2px dashed var(--gray-300); border-radius: var(--radius-lg);
  padding: 24px; text-align: center; background: var(--gray-50);
}
.pdf-icon { margin-bottom: 12px; }
.doc-name { font-size: 14px; font-weight: 500; color: var(--gray-700); margin-bottom: 16px; }
.doc-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

.decision-actions { display: flex; flex-direction: column; gap: 10px; }
.decision-actions .btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; font-weight: 600; }
.btn-reject { border-color: var(--danger); color: var(--danger); }
.btn-reject:hover { background: var(--danger-bg); border-color: var(--danger); }

.timeline { display: flex; flex-direction: column; gap: 0; }
.tl-item { display: flex; gap: 12px; position: relative; padding-bottom: 20px; }
.tl-item:last-child { padding-bottom: 0; }
.tl-item::before {
  content: ''; position: absolute; left: 9px; top: 20px; bottom: 0;
  width: 2px; background: var(--gray-200);
}
.tl-item:last-child::before { display: none; }
.tl-item.done::before { background: var(--success); }
.tl-item.active::before { background: var(--danger); }

.tl-dot {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: var(--gray-200); display: flex; align-items: center; justify-content: center;
  margin-top: 1px; position: relative; z-index: 1;
}
.tl-dot.done { background: var(--success); color: white; }
.tl-dot.active { background: var(--danger); color: white; }

.tl-label { font-size: 13px; font-weight: 500; color: var(--gray-500); }
.tl-item.done .tl-label { color: var(--success); }
.tl-item.active .tl-label { color: var(--danger); font-weight: 600; }
.tl-date { font-size: 11px; color: var(--gray-400); margin-top: 1px; }

.detail-table td { border-bottom: none; padding: 8px 12px; }
.detail-table tr:not(:last-child) td { border-bottom: 1px solid var(--gray-100); }
</style>
