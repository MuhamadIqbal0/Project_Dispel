<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'

const store = useLaporanStore()
const stats = ref({ total: 0, pending: 0, diterima: 0, ditolak: 0 })
const chartData = ref([])
const recentLaporan = ref([])
const selectedLaporan = ref(null)
const showDetailModal = ref(false)

function openDetail(l) {
  selectedLaporan.value = l
  showDetailModal.value = true
}

const donutSegments = computed(() => {
  const t = stats.value.total || 1
  const items = [
    { label: 'Diterima', value: stats.value.diterima, color: '#0d9488' },
    { label: 'Pending', value: stats.value.pending, color: '#f59e0b' },
    { label: 'Ditolak', value: stats.value.ditolak, color: '#ef4444' },
  ]
  let offset = 0
  return items.map(item => {
    const length = (item.value / t) * 251.2
    const seg = { ...item, dasharray: `${length} ${251.2 - length}`, dashoffset: -offset }
    offset += length
    return seg
  })
})

const maxChartValue = computed(() => {
  return Math.max(...chartData.value.map(d => d.total), 1)
})

onMounted(async () => {
  await Promise.all([
    store.fetchLaporan(),
    store.fetchStats().then(s => stats.value = s),
    store.fetchRekap().then(r => {
      chartData.value = r.slice(0, 6).reverse()
    }),
  ])
  recentLaporan.value = [...store.laporanList].slice(0, 5)
})

const cards = [
  {
    label: 'Total Laporan Masuk',
    value: () => stats.value.total,
    variant: 'primary',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>',
  },
  {
    label: 'Menunggu Verifikasi',
    value: () => stats.value.pending,
    variant: 'warning',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>',
  },
  {
    label: 'Laporan Diterima',
    value: () => stats.value.diterima,
    variant: 'success',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
  },
  {
    label: 'Laporan Ditolak',
    value: () => stats.value.ditolak,
    variant: 'danger',
    icon: '<svg viewBox="0 0 20 20" width="24" height="24" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
  },
]
</script>

<template>
  <div>
    <h2 class="page-title">Dashboard</h2>

    <div class="stats-grid">
      <div v-for="card in cards" :key="card.label" class="stat-card">
        <div class="stat-icon" :class="card.variant" v-html="card.icon"></div>
        <div class="stat-info">
          <p class="stat-value">{{ card.value() }}</p>
          <p class="stat-label">{{ card.label }}</p>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-top:24px;">
      <div class="card">
        <div class="toolbar">
          <h3 class="section-title">Grafik Laporan per Periode</h3>
        </div>
        <div class="chart-wrap">
          <div class="bar-chart">
            <div v-for="d in chartData" :key="d.periode" class="bar-group">
              <div class="bar-stack">
                <div class="bar bar-ditolak" :style="{ height: (d.ditolak / maxChartValue) * 100 + '%' }" title="Ditolak: {{ d.ditolak }}"></div>
                <div class="bar bar-pending" :style="{ height: (d.pending / maxChartValue) * 100 + '%' }" title="Pending: {{ d.pending }}"></div>
                <div class="bar bar-diterima" :style="{ height: (d.diterima / maxChartValue) * 100 + '%' }" title="Diterima: {{ d.diterima }}"></div>
              </div>
              <span class="bar-label">{{ d.periode }}</span>
            </div>
            <div v-if="chartData.length === 0" class="chart-empty">Belum ada data laporan</div>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-dot" style="background:#0d9488;"></span> Diterima</div>
            <div class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span> Pending</div>
            <div class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span> Ditolak</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="toolbar">
          <h3 class="section-title">Status Laporan</h3>
        </div>
        <div class="donut-wrap">
          <svg viewBox="0 0 100 100" class="donut">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" stroke-width="18"/>
            <circle v-for="s in donutSegments" :key="s.label"
              cx="50" cy="50" r="40" fill="none"
              :stroke="s.color" stroke-width="18" stroke-linecap="round"
              :stroke-dasharray="s.dasharray" :stroke-dashoffset="s.dashoffset"
              transform="rotate(-90 50 50)"/>
          </svg>
          <div class="donut-center">
            <span class="donut-total">{{ stats.total }}</span>
            <span class="donut-label">Total</span>
          </div>
        </div>
        <div class="donut-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#0d9488;"></span> Diterima ({{ stats.diterima }})</div>
          <div class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span> Pending ({{ stats.pending }})</div>
          <div class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span> Ditolak ({{ stats.ditolak }})</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="toolbar">
        <h3 class="section-title">Aktivitas Laporan Terbaru</h3>
        <router-link to="/verifikasi" class="btn btn-teal btn-sm">Lihat Semua</router-link>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Nama Perusahaan</th>
            <th>Waktu Masuk</th>
            <th>Negara Tujuan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in recentLaporan" :key="l.id">
            <td><strong>{{ l.perusahaan }}</strong></td>
            <td>{{ l.tgl_upload }}</td>
            <td>{{ l.negara }}</td>
            <td>
              <span class="badge" :class="{
                'badge-warning': l.status === 'pending',
                'badge-success': l.status === 'diterima',
                'badge-danger': l.status === 'ditolak',
                'badge-info': !['pending','diterima','ditolak'].includes(l.status)
              }">
                {{ l.status === 'diterima' ? 'Diterima' : l.status === 'ditolak' ? 'Ditolak' : 'Pending' }}
              </span>
            </td>
            <td>
              <button class="btn btn-outline btn-sm" @click="openDetail(l)">Lihat Data</button>
            </td>
          </tr>
          <tr v-if="recentLaporan.length === 0">
            <td colspan="5" class="empty-state">Belum ada laporan</td>
          </tr>
        </tbody>
      </table>
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
            <tr><td style="font-weight: 500;">Status</td><td>
              <span class="badge" :class="{
                'badge-warning': selectedLaporan.status === 'pending',
                'badge-success': selectedLaporan.status === 'diterima',
                'badge-danger': selectedLaporan.status === 'ditolak',
              }">{{ selectedLaporan.status === 'diterima' ? 'Diterima' : selectedLaporan.status === 'ditolak' ? 'Ditolak' : 'Pending' }}</span>
            </td></tr>
            <tr><td style="font-weight: 500;">Waktu Masuk</td><td>{{ selectedLaporan.tgl_upload }}</td></tr>
            <tr><td style="font-weight: 500;">Catatan</td><td style="color: var(--gray-500)">{{ selectedLaporan.catatan || '-' }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  display: flex; flex-direction: column; gap: 16px;
}
.chart-wrap .chart-legend {
  display: flex; gap: 16px; justify-content: center;
}
.chart-wrap .legend-item { font-size: 12px; color: var(--gray-500); }
.chart-wrap .legend-dot { width: 8px; height: 8px; }

.bar-chart {
  display: flex; gap: 12px; align-items: flex-end; width: 100%; height: 200px;
  padding: 24px 8px 0;
}
.bar-group {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
  height: 100%; justify-content: flex-end;
}
.bar-stack {
  width: 100%; max-width: 36px; display: flex; flex-direction: column;
  align-items: center; gap: 1px; height: 100%; justify-content: flex-end;
}
.bar {
  width: 100%; border-radius: 3px 3px 0 0; min-height: 2px;
  transition: height 0.5s ease;
}
.bar-diterima { background: #0d9488; }
.bar-pending { background: #f59e0b; }
.bar-ditolak { background: #ef4444; }
.bar-label { font-size: 10px; color: var(--gray-400); white-space: nowrap; }
.chart-empty {
  width: 100%; text-align: center; color: var(--gray-400);
  font-size: 13px; padding: 40px 0;
}

.donut-wrap { position: relative; width: 160px; height: 160px; margin: 0 auto; }
.donut { width: 100%; height: 100%; }
.donut-center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.donut-total { font-size: 28px; font-weight: 700; color: var(--gray-900); line-height: 1; }
.donut-label { font-size: 12px; color: var(--gray-500); margin-top: 2px; }

.donut-legend { display: flex; flex-direction: column; gap: 6px; margin-top: 16px; }
.donut-legend .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-600); }
.donut-legend .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 0 0 16px;
}
.modal-close {
  background: none; border: none; font-size: 28px; color: var(--gray-400);
  cursor: pointer; line-height: 1; padding: 0 4px;
}
.modal-close:hover { color: var(--gray-600); }
.detail-table td { border-bottom: none; padding: 8px 12px; }
.detail-table tr:not(:last-child) td { border-bottom: 1px solid var(--gray-100); }
</style>
