<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const users = ref([])
const search = ref('')
const showModal = ref(false)
const editing = ref(false)
const selectedUser = ref(null)

const form = ref({ name: '', email: '', password: '', role: 'pt' })

onMounted(loadUsers)

async function loadUsers() {
  const res = await api.get('/users')
  users.value = res.data
}

const filteredUsers = computed(() => {
  if (!search.value) return users.value
  const s = search.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(s) ||
    u.email.toLowerCase().includes(s) ||
    u.role.toLowerCase().includes(s)
  )
})

import { computed } from 'vue'

function openAdd() {
  editing.value = false
  selectedUser.value = null
  form.value = { name: '', email: '', password: '', role: 'pt' }
  showModal.value = true
}

function openEdit(u) {
  editing.value = true
  selectedUser.value = u
  form.value = { name: u.name, email: u.email, password: '', role: u.role }
  showModal.value = true
}

async function save() {
  if (!form.value.name || !form.value.email || (!editing.value && !form.value.password) || !form.value.role) {
    return
  }
  try {
    if (editing.value) {
      const res = await api.put('/users/' + selectedUser.value.id, form.value)
      const idx = users.value.findIndex(u => u.id === selectedUser.value.id)
      if (idx !== -1) users.value[idx] = res.data
    } else {
      const res = await api.post('/users', form.value)
      users.value.push(res.data)
    }
    showModal.value = false
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal menyimpan akun')
  }
}

async function remove(u) {
  if (!confirm('Yakin ingin menghapus akun ' + u.name + '?')) return
  try {
    await api.delete('/users/' + u.id)
    users.value = users.value.filter(x => x.id !== u.id)
  } catch (err) {
    alert(err.response?.data?.error || 'Gagal menghapus akun')
  }
}

const roleBadge = (r) => {
  if (r === 'admin') return { text: 'Admin', cls: 'badge-primary' }
  return { text: 'Perusahaan', cls: 'badge-info' }
}
</script>

<template>
  <div>
    <h2 class="page-title">Manajemen Akun</h2>

    <div class="card">
      <div class="toolbar">
        <h3 class="section-title">Daftar Akun Pengguna</h3>
        <div class="toolbar-actions">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
            <input v-model="search" class="form-input search-input" placeholder="Cari akun..." />
          </div>
          <button class="btn btn-teal" @click="openAdd">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            Tambah Akun
          </button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th style="width:50px;text-align:center">No</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th style="width:160px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(u, i) in filteredUsers" :key="u.id">
            <td style="text-align:center">{{ i + 1 }}</td>
            <td><strong>{{ u.name }}</strong></td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="roleBadge(u.role).cls">{{ roleBadge(u.role).text }}</span></td>
            <td>
              <button class="btn btn-outline btn-sm" @click="openEdit(u)">Edit</button>
              <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);margin-left:6px" @click="remove(u)" :disabled="u.id === auth.user?.id">Hapus</button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="empty-state">Tidak ada akun</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop style="max-width:460px">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">{{ editing ? 'Edit Akun' : 'Tambah Akun Baru' }}</h3>
            <p class="modal-sub">{{ editing ? 'Ubah data akun pengguna' : 'Buat akun baru untuk pengguna' }}</p>
          </div>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <form @submit.prevent="save">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.name" class="form-input" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-input" required />
          </div>
          <div class="form-group">
            <label>{{ editing ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password' }}</label>
            <input v-model="form.password" type="password" class="form-input" :required="!editing" minlength="6" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role" class="form-select">
              <option value="pt">Perusahaan (PT)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="modal-actions" style="justify-content:flex-end;padding-top:12px">
            <button type="button" class="btn btn-outline" @click="showModal = false">Batal</button>
            <button type="submit" class="btn btn-primary">{{ editing ? 'Simpan Perubahan' : 'Tambah Akun' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-wrap { position: relative; max-width: 240px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.search-wrap .search-input { padding-left: 36px; }
.toolbar-actions { display: flex; gap: 8px; align-items: center; margin-left: auto; }
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 0 0 16px;
}
.modal-close {
  background: none; border: none; font-size: 28px; color: var(--gray-400);
  cursor: pointer; line-height: 1; padding: 0 4px;
}
.modal-close:hover { color: var(--gray-600); }
</style>
