<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLaporanStore } from '../../stores/laporan'
import { jsPDF } from 'jspdf'
import { autoTable, applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

const store = useLaporanStore()
const search = ref('')
const filterStatus = ref('')
const filterNegara = ref('')
const filterPerusahaan = ref('')
const currentPage = ref(1)
const perPage = ref(10)

onMounted(async () => {
  await Promise.all([
    store.fetchLaporan(),
    store.fetchPerusahaan(),
  ])
})

watch([search, filterStatus, filterNegara, filterPerusahaan], async () => {
  currentPage.value = 1
  await store.fetchLaporan({
    search: search.value || undefined,
    status: filterStatus.value || undefined,
    negara: filterNegara.value || undefined,
  })
})

const negaraList = computed(() => [...new Set(store.laporanList.map(l => l.negara))].sort())

const flatList = computed(() => {
  let list = store.laporanList
  if (filterPerusahaan.value) {
    list = list.filter(l => l.perusahaan === filterPerusahaan.value)
  }
  const result = []
  for (const l of list) {
    const names = l.cpmi_list && l.cpmi_list.length ? l.cpmi_list : ['-']
    for (const name of names) {
      result.push({ ...l, nama_cpmi: name })
    }
  }
  return result
})
const totalPages = computed(() => Math.ceil(flatList.value.length / perPage.value))
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return flatList.value.slice(start, start + perPage.value)
})

const selectedLaporan = ref(null)
const showDetailModal = ref(false)

function openDetail(l) {
  selectedLaporan.value = l
  showDetailModal.value = true
}

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}

const statusBadge = (s) => {
  if (s === 'diterima' || s === 'Siap Berangkat') return { text: 'Siap Berangkat', cls: 'badge-success' }
  if (s === 'pending' || s === 'Dalam Proses') return { text: 'Dalam Proses', cls: 'badge-info' }
  if (s === 'ditolak' || s === 'Dibatalkan') return { text: 'Dibatalkan', cls: 'badge-danger' }
  return { text: s, cls: 'badge-info' }
}

function exportPDF() {
  const doc = new jsPDF('landscape', 'mm', 'a4')
  doc.setFontSize(16)
  doc.text('Data CPMI', 14, 16)
  doc.setFontSize(10)
  doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 23)

  const statusMap = { diterima: 'Siap Berangkat', pending: 'Dalam Proses', ditolak: 'Dibatalkan' }
  const rows = store.laporanList.map(l => [
    l.perusahaan,
    l.periode,
    String(l.jumlah),
    l.negara,
    statusMap[l.status] || l.status,
    l.tgl_upload,
  ])

  doc.autoTable({
    startY: 28,
    head: [['Perusahaan', 'Periode', 'Jumlah CPMI', 'Negara Tujuan', 'Status', 'Tgl Upload']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 148, 136] },
  })

  doc.save(`data-cpmi-${new Date().toISOString().split('T')[0]}.pdf`)
}

function exportCSV() {
  const header = 'Perusahaan,Periode,Jumlah,Negara,Status,Tgl Upload\n'
  const rows = store.laporanList.map(l =>
    `${l.perusahaan},${l.periode},${l.jumlah},${l.negara},${l.status},${l.tgl_upload}`
  ).join('\n')
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `data-cpmi-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
</script>

<template>
  <div>
    <h2 class="page-title">Manajemen Data CPMI</h2>

    <div class="card card-filter">
      <div class="filter-grid">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
          <input v-model="search" class="form-input search-input" placeholder="Cari nama CPMI..." />
        </div>
        <select v-model="filterStatus" class="form-select">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="diterima">Diterima</option>
          <option value="ditolak">Ditolak</option>
        </select>
        <select v-model="filterNegara" class="form-select">
          <option value="">Semua Negara</option>
          <option v-for="n in negaraList" :key="n" :value="n">{{ n }}</option>
        </select>
        <select v-model="filterPerusahaan" class="form-select">
          <option value="">Semua Perusahaan</option>
          <option v-for="p in store.perusahaanList" :key="p.id" :value="p.nama">{{ p.nama }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">DATA CPMI</h3>
        <div class="export-group">
          <button class="btn btn-teal btn-sm" @click="exportPDF">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>
            Export PDF
          </button>
          <button class="btn btn-teal btn-sm" @click="exportCSV">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            Export Excel
          </button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">No</th>
            <th>Nama CPMI</th>
            <th>Perusahaan</th>
            <th>Negara Tujuan</th>
            <th>Periode</th>
            <th>Status</th>
            <th>Sumber Laporan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in paginatedList" :key="c.id + '-' + c.nama_cpmi">
            <td style="text-align: center;">{{ (currentPage - 1) * perPage + i + 1 }}</td>
            <td>{{ c.nama_cpmi }}</td>
            <td><strong>{{ c.perusahaan }}</strong></td>
            <td>{{ c.negara }}</td>
            <td>{{ c.periode }}</td>
            <td>
              <span class="badge" :class="statusBadge(c.status).cls">
                {{ statusBadge(c.status).text }}
              </span>
            </td>
            <td>{{ c.file || '-' }}</td>
            <td>
              <button class="btn btn-outline btn-sm" @click="openDetail(c)">Lihat</button>
            </td>
          </tr>
          <tr v-if="paginatedList.length === 0">
            <td colspan="8" class="empty-state">Tidak ada data</td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        <p class="table-info">Menampilkan {{ paginatedList.length }} dari {{ flatList.length }} data</p>
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>
          <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal && selectedLaporan" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Detail CPMI</h3>
            <p class="modal-sub">{{ selectedLaporan.nama_cpmi }} — {{ selectedLaporan.perusahaan }} ({{ selectedLaporan.periode }})</p>
          </div>
          <button class="modal-close" @click="showDetailModal = false">&times;</button>
        </div>
        <table class="table detail-table">
          <tbody>
            <tr><td style="font-weight: 500; width: 140px;">Nama CPMI</td><td>{{ selectedLaporan.nama_cpmi }}</td></tr>
            <tr><td style="font-weight: 500;">Perusahaan</td><td>{{ selectedLaporan.perusahaan }}</td></tr>
            <tr><td style="font-weight: 500;">Periode</td><td>{{ selectedLaporan.periode }}</td></tr>
            <tr><td style="font-weight: 500;">Negara Tujuan</td><td>{{ selectedLaporan.negara }}</td></tr>
            <tr><td style="font-weight: 500;">Status</td><td>
              <span class="badge" :class="statusBadge(selectedLaporan.status).cls">{{ statusBadge(selectedLaporan.status).text }}</span>
            </td></tr>
            <tr><td style="font-weight: 500;">Sumber Laporan</td><td>{{ selectedLaporan.file || '-' }}</td></tr>
            <tr><td style="font-weight: 500;">Tanggal Upload</td><td>{{ selectedLaporan.tgl_upload }}</td></tr>
            <tr><td style="font-weight: 500;">Catatan</td><td style="color: var(--gray-500)">{{ selectedLaporan.catatan || '-' }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-filter { padding: 16px 20px; margin-bottom: 20px; }
.filter-grid {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
}
.filter-grid .search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
.filter-grid .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.filter-grid .search-input { padding-left: 36px; }
.filter-grid .form-select { width: 160px; }

.export-group { display: flex; gap: 8px; }

.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 16px; flex-wrap: wrap; gap: 12px;
}
.table-info { font-size: 13px; color: var(--gray-400); }

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

.pagination { display: flex; gap: 4px; }
.page-btn {
  width: 34px; height: 34px; border: 1px solid var(--gray-200);
  border-radius: var(--radius); background: var(--white); color: var(--gray-600);
  font-size: 13px; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.page-btn:hover { border-color: var(--teal); color: var(--teal); transform: translateY(-1px); box-shadow: var(--shadow); }
.page-btn.active { background: var(--teal); border-color: var(--teal); color: white; box-shadow: 0 2px 6px rgba(13,148,136,0.3); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
