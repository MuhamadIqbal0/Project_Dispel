<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'
import { jsPDF } from 'jspdf'
import { autoTable, applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

const store = useLaporanStore()
const search = ref('')
const filterAksi = ref('')
const logs = ref([])
const currentPage = ref(1)
const perPage = ref(10)

const aksiOptions = ['', 'Upload Laporan', 'Konfirmasi Terima', 'Konfirmasi Tolak']

async function loadLogs() {
  const params = {}
  if (search.value) params.search = search.value
  if (filterAksi.value) params.aksi = filterAksi.value
  logs.value = await store.fetchLog(params)
  currentPage.value = 1
}

onMounted(loadLogs)

async function onSearch() {
  await loadLogs()
}

const totalPages = computed(() => Math.ceil(logs.value.length / perPage.value))
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return logs.value.slice(start, start + perPage.value)
})

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}

function exportPDF() {
  const doc = new jsPDF('landscape', 'mm', 'a4')
  doc.setFontSize(16)
  doc.text('Log Aktivitas Sistem', 14, 16)
  doc.setFontSize(10)
  doc.text('Tanggal Export: ' + new Date().toLocaleDateString('id-ID'), 14, 23)

  const rows = logs.value.map(l => [
    l.waktu,
    l.user_name,
    l.aksi,
    l.detail,
  ])

  doc.autoTable({
    startY: 28,
    head: [['Waktu', 'Pengguna', 'Aksi', 'Detail']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 148, 136] },
  })

  doc.save('log-aktivitas-' + new Date().toISOString().split('T')[0] + '.pdf')
}

function exportCSV() {
  const header = 'Waktu,Pengguna,Aksi,Detail\n'
  const rows = logs.value.map(l =>
    '"' + l.waktu + '","' + l.user_name + '","' + l.aksi + '","' + (l.detail || '').replace(/"/g, '""') + '"'
  ).join('\n')
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'log-aktivitas-' + new Date().toISOString().split('T')[0] + '.csv'
  link.click()
}
</script>

<template>
  <div>
    <h2 class="page-title">Riwayat Laporan</h2>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Log Aktivitas Sistem</h3>
        <div class="toolbar-actions">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
            <input v-model="search" class="form-input search-input" placeholder="Cari aktivitas..." @input="onSearch" />
          </div>
          <select v-model="filterAksi" class="form-select" @change="loadLogs">
            <option value="">Semua Aksi</option>
            <option v-for="a in aksiOptions.slice(1)" :key="a" :value="a">{{ a }}</option>
          </select>
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
            <th>Waktu</th>
            <th>Pengguna</th>
            <th>Aksi</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, i) in paginatedLogs" :key="log.id">
            <td style="text-align: center;">{{ (currentPage - 1) * perPage + i + 1 }}</td>
            <td style="white-space:nowrap">{{ log.waktu }}</td>
            <td><strong>{{ log.user_name }}</strong></td>
            <td><span class="badge badge-primary">{{ log.aksi }}</span></td>
            <td style="color:var(--gray-500)">{{ log.detail }}</td>
          </tr>
          <tr v-if="paginatedLogs.length === 0">
            <td colspan="5" class="empty-state">Tidak ada log aktivitas</td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        <p class="table-info">Menampilkan {{ paginatedLogs.length }} dari {{ logs.length }} data</p>
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
  </div>
</template>

<style scoped>
.search-wrap { position: relative; max-width: 240px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.search-wrap .search-input { padding-left: 36px; }
.toolbar-actions { display: flex; gap: 8px; align-items: center; margin-left: auto; }
.toolbar-actions .form-select { width: 160px; }
.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 16px; flex-wrap: wrap; gap: 12px;
}
.table-info { font-size: 13px; color: var(--gray-400); }
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
