<script setup>
import { ref, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'

const store = useLaporanStore()
const filterPeriode = ref('')
const filterPerusahaan = ref('')
const filterNegara = ref('')
const rekapData = ref([])
const perusahaanList = ref([])
const negaraList = ref([])
const periodeList = ref([])

onMounted(async () => {
  await store.fetchLaporan()
  perusahaanList.value = [...new Set(store.laporanList.map(l => l.perusahaan))].sort()
  negaraList.value = [...new Set(store.laporanList.map(l => l.negara))].sort()
  periodeList.value = [...new Set(store.laporanList.map(l => l.periode))].sort()
  await loadRekap()
})

async function loadRekap() {
  rekapData.value = await store.fetchRekap({
    periode: filterPeriode.value || undefined,
    perusahaan: filterPerusahaan.value || undefined,
    negara: filterNegara.value || undefined,
  })
}

const totalRekap = () => rekapData.value.reduce((acc, r) => ({
  total: acc.total + r.total,
  diterima: acc.diterima + r.diterima,
  ditolak: acc.ditolak + r.ditolak,
  pending: acc.pending + r.pending,
}), { total: 0, diterima: 0, ditolak: 0, pending: 0 })

function exportCSV() {
  const header = 'Periode,Total,Diterima,Ditolak,Pending\n'
  const rows = rekapData.value.map(r => `${r.periode},${r.total},${r.diterima},${r.ditolak},${r.pending}`).join('\n')
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `rekap-cpmi-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
</script>

<template>
  <div>
    <h2 class="page-title">Rekap & Monitoring</h2>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Rekap Data CPMI</h3>
        <button class="btn btn-primary btn-sm" @click="exportCSV">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          Ekspor CSV
        </button>
      </div>

      <div class="filters">
        <select v-model="filterPeriode" class="form-select" style="flex:1" @change="loadRekap">
          <option value="">Semua Periode</option>
          <option v-for="p in periodeList" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filterPerusahaan" class="form-select" style="flex:1" @change="loadRekap">
          <option value="">Semua Perusahaan</option>
          <option v-for="p in perusahaanList" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="filterNegara" class="form-select" style="flex:1" @change="loadRekap">
          <option value="">Semua Negara</option>
          <option v-for="n in negaraList" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Periode</th>
            <th>Total</th>
            <th>Diterima</th>
            <th>Ditolak</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rekapData" :key="r.periode">
            <td><strong>{{ r.periode }}</strong></td>
            <td>{{ r.total }}</td>
            <td><span class="badge badge-success">{{ r.diterima }}</span></td>
            <td><span class="badge badge-danger">{{ r.ditolak }}</span></td>
            <td><span class="badge badge-warning">{{ r.pending }}</span></td>
          </tr>
          <tr v-if="rekapData.length === 0">
            <td colspan="5" class="empty-state">Tidak ada data</td>
          </tr>
        </tbody>
      </table>

      <div class="summary" v-if="rekapData.length > 0">
        <div class="summary-item"><span class="summary-label">Total</span><span class="summary-value">{{ totalRekap().total }}</span></div>
        <div class="summary-item"><span class="summary-label">Diterima</span><span class="summary-value" style="color:var(--success)">{{ totalRekap().diterima }}</span></div>
        <div class="summary-item"><span class="summary-label">Ditolak</span><span class="summary-value" style="color:var(--danger)">{{ totalRekap().ditolak }}</span></div>
        <div class="summary-item"><span class="summary-label">Pending</span><span class="summary-value" style="color:var(--warning)">{{ totalRekap().pending }}</span></div>
      </div>
    </div>
  </div>
</template>
