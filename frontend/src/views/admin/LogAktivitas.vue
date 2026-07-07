<script setup>
import { ref, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'

const store = useLaporanStore()
const search = ref('')
const logs = ref([])

async function loadLogs() {
  logs.value = await store.fetchLog(search.value)
}

onMounted(loadLogs)

async function onSearch() {
  await loadLogs()
}
</script>

<template>
  <div>
    <h2 class="page-title">Riwayat Laporan</h2>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Log Aktivitas Sistem</h3>
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
          <input v-model="search" class="form-input search-input" placeholder="Cari aktivitas..." @input="onSearch" />
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Pengguna</th>
            <th>Aksi</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td style="white-space:nowrap">{{ log.waktu }}</td>
            <td><strong>{{ log.user_name }}</strong></td>
            <td><span class="badge badge-primary">{{ log.aksi }}</span></td>
            <td style="color:var(--gray-500)">{{ log.detail }}</td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="4" class="empty-state">Tidak ada log aktivitas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.search-wrap { position: relative; max-width: 320px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.search-wrap .search-input { padding-left: 36px; }
</style>
