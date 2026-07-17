<script setup>
import { ref, onMounted } from 'vue'
import { useLaporanStore } from '../../stores/laporan'

const store = useLaporanStore()
const showForm = ref(false)
const showDetail = ref(false)
const editItem = ref(null)
const detailItem = ref(null)
const form = ref({ nama: '', alamat: '', kontak: '', status: 'aktif' })
const errorMsg = ref('')

onMounted(async () => {
  await store.fetchPerusahaan()
})

function resetForm() { form.value = { nama: '', alamat: '', kontak: '', status: 'aktif' }; editItem.value = null }

function openAdd() { resetForm(); showForm.value = true }

function openEdit(p) {
  editItem.value = p
  form.value = { nama: p.nama, alamat: p.alamat, kontak: p.kontak, status: p.status || 'aktif' }
  showForm.value = true
}

async function save() {
  errorMsg.value = ''
  try {
    if (editItem.value) {
      await store.updatePerusahaan(editItem.value.id, form.value)
    } else {
      await store.addPerusahaan(form.value)
    }
    await store.fetchPerusahaan()
    showForm.value = false
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.message
  }
}

async function toggleStatus(p) {
  errorMsg.value = ''
  try {
    const newStatus = p.status === 'aktif' ? 'nonaktif' : 'aktif'
    await store.updatePerusahaan(p.id, { status: newStatus })
    await store.fetchPerusahaan()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal mengubah status'
  }
}

function openDetail(p) {
  detailItem.value = p
  showDetail.value = true
}

async function confirmDelete(p) {
  if (!confirm(`Yakin ingin menghapus perusahaan "${p.nama}"?`)) return
  await store.deletePerusahaan(p.id)
  await store.fetchPerusahaan()
}
</script>

<template>
  <div>
    <h2 class="page-title">Manajemen Perusahaan</h2>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Data Perusahaan (PT)</h3>
        <button class="btn btn-primary btn-sm" @click="openAdd">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          Tambah PT
        </button>
      </div>

      <p v-if="errorMsg" class="msg-error">{{ errorMsg }}</p>
      <table class="table">
        <thead>
          <tr>
            <th>Nama Perusahaan</th>
            <th>Alamat</th>
            <th>Kontak</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.perusahaanList" :key="p.id">
            <td><strong>{{ p.nama }}</strong></td>
            <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ p.alamat }}</td>
            <td>{{ p.kontak }}</td>
            <td>
              <span class="badge" :class="p.status === 'aktif' ? 'badge-accent' : 'badge-danger'">
                {{ p.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td>
              <div class="action-icons">
                <button class="icon-btn" title="Edit" @click="openEdit(p)">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                </button>
                <button class="icon-btn" title="Lihat Detail" @click="openDetail(p)">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                </button>
                <button class="icon-btn" :title="p.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'" @click="toggleStatus(p)">
                  <svg v-if="p.status === 'aktif'" viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 012 0v12a1 1 0 01-2 0V3zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 010-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                  <svg v-else viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
                <button class="icon-btn" title="Hapus" @click="confirmDelete(p)">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="store.perusahaanList.length === 0">
            <td colspan="5" class="empty-state">Belum ada perusahaan terdaftar</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal-overlay" @click="showForm = false">
      <div class="modal" @click.stop>
        <h3 class="modal-title">{{ editItem ? 'Edit' : 'Tambah' }} Perusahaan</h3>
        <div class="form-group">
          <label>Nama Perusahaan</label>
          <input v-model="form.nama" class="form-input" placeholder="Nama lengkap PT" required />
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <textarea v-model="form.alamat" class="form-textarea" placeholder="Alamat lengkap perusahaan"></textarea>
        </div>
        <div class="form-group">
          <label>Kontak</label>
          <input v-model="form.kontak" class="form-input" placeholder="Nomor telepon / email" />
        </div>
        <div class="form-group">
          <label>Status Akun</label>
          <select v-model="form.status" class="form-select">
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showForm = false">Batal</button>
          <button class="btn btn-primary" @click="save">Simpan</button>
        </div>
      </div>
    </div>

    <div v-if="showDetail && detailItem" class="modal-overlay" @click="showDetail = false">
      <div class="modal" @click.stop>
        <h3 class="modal-title">Detail Perusahaan</h3>
        <div class="detail-group">
          <label>Nama Perusahaan</label>
          <p class="detail-value">{{ detailItem.nama }}</p>
        </div>
        <div class="detail-group">
          <label>Alamat</label>
          <p class="detail-value">{{ detailItem.alamat || '-' }}</p>
        </div>
        <div class="detail-group">
          <label>Kontak</label>
          <p class="detail-value">{{ detailItem.kontak || '-' }}</p>
        </div>
        <div class="detail-group">
          <label>Status</label>
          <span class="badge" :class="detailItem.status === 'aktif' ? 'badge-accent' : 'badge-danger'">
            {{ detailItem.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showDetail = false">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-accent { background: #ccfbf1; color: #0d9488; }

.detail-group { margin-bottom: 16px; }
.detail-group label { display: block; font-size: 0.8rem; color: var(--gray-500); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { margin: 0; font-size: 1rem; color: var(--navy); }

.action-icons { display: flex; gap: 2px; }
.icon-btn {
  width: 34px; height: 34px; border: none; border-radius: var(--radius);
  background: transparent; color: var(--gray-500); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn:hover { background: var(--gray-100); color: var(--navy); transform: translateY(-1px); }
.icon-btn:active { transform: translateY(0); }
</style>
