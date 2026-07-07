<script setup>
import { ref, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'

const store = useLaporanStore()
const search = ref('')

onMounted(async () => {
  await store.fetchLaporan()
})

async function cari() {
  await store.fetchLaporan({ search: search.value || undefined })
}
</script>

<template>
  <div>
    <h2 class="page-title">Riwayat Laporan</h2>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Arsip Laporan</h3>
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
          <input v-model="search" class="form-input search-input" placeholder="Cari periode atau negara..." @input="cari" />
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Periode</th>
            <th>Jumlah CPMI</th>
            <th>Negara Tujuan</th>
            <th>File</th>
            <th>Status</th>
            <th>Tgl Upload</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in store.laporanList" :key="l.id">
            <td><strong>{{ l.periode }}</strong></td>
            <td>{{ l.jumlah }} orang</td>
            <td>{{ l.negara }}</td>
            <td><span class="file-badge">{{ l.file || '-' }}</span></td>
            <td>
              <span class="badge" :class="{
                'badge-warning': l.status === 'pending',
                'badge-success': l.status === 'diterima',
                'badge-danger': l.status === 'ditolak',
                'badge-info': !['pending','diterima','ditolak'].includes(l.status)
              }">
                {{ l.status === 'diterima' ? '✓ Diterima' : l.status === 'ditolak' ? '✕ Ditolak' : '⏳ Pending' }}
              </span>
            </td>
            <td>{{ l.tgl_upload }}</td>
            <td style="font-size:13px;color:var(--gray-500);max-width:200px">{{ l.catatan || '-' }}</td>
          </tr>
          <tr v-if="store.laporanList.length === 0">
            <td colspan="7" class="empty-state">Belum ada laporan</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.search-wrap { position: relative; max-width: 300px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.search-wrap .search-input { padding-left: 36px; }
</style>
