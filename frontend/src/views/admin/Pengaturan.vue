<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const auth = useAuthStore()
const activeTab = ref('profil')

const profileForm = ref({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

const successMsg = ref('')
const errorMsg = ref('')
const uploading = ref(false)
const saving = ref(false)
const fotoPreview = ref(null)

watch(() => auth.user, (u) => {
  if (u) {
    profileForm.value.name = u.name || ''
    profileForm.value.email = u.email || ''
  }
}, { immediate: true })

function triggerFileInput() {
  document.getElementById('foto-input').click()
}

async function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = 'Ukuran file maksimal 2MB'
    setTimeout(() => errorMsg.value = '', 3000)
    return
  }

  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    errorMsg.value = 'Hanya file gambar (jpg, jpeg, png, gif, webp) yang diizinkan'
    setTimeout(() => errorMsg.value = '', 3000)
    return
  }

  uploading.value = true
  errorMsg.value = ''
  const fd = new FormData()
  fd.append('foto', file)

  try {
    const res = await api.post('/auth/upload-foto', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    auth.user = res.data.user
    const saved = JSON.parse(sessionStorage.getItem('user') || '{}')
    sessionStorage.setItem('user', JSON.stringify({ ...res.data.user, token: saved.token }))
    fotoPreview.value = null
    successMsg.value = 'Foto profil berhasil diupload'
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal upload foto'
  } finally {
    uploading.value = false
    e.target.value = ''
    setTimeout(() => successMsg.value = '', 3000)
  }
}

function previewBeforeUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  fotoPreview.value = URL.createObjectURL(file)
}

async function saveProfile() {
  saving.value = true
  errorMsg.value = ''
  try {
    const res = await api.put('/auth/profile', {
      name: profileForm.value.name,
      email: profileForm.value.email,
    })
    auth.user = res.data.user
    const saved = JSON.parse(sessionStorage.getItem('user') || '{}')
    sessionStorage.setItem('user', JSON.stringify({ ...res.data.user, token: saved.token }))
    successMsg.value = 'Profil berhasil diperbarui'
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal menyimpan profil'
  } finally {
    saving.value = false
    setTimeout(() => successMsg.value = '', 3000)
  }
}

function savePassword() {
  if (passwordForm.value.new !== passwordForm.value.confirm) return
  successMsg.value = 'Password berhasil diubah'
  setTimeout(() => successMsg.value = '', 3000)
  passwordForm.value = { current: '', new: '', confirm: '' }
}
</script>

<template>
  <div>
    <h2 class="page-title">Pengaturan</h2>

    <div class="card">
      <div class="tab-bar">
        <button class="tab-btn" :class="{ active: activeTab === 'profil' }" @click="activeTab = 'profil'">Profil</button>
        <button class="tab-btn" :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">Ubah Password</button>
      </div>

      <p v-if="successMsg" class="msg-success">{{ successMsg }}</p>
      <p v-if="errorMsg" class="msg-error">{{ errorMsg }}</p>

      <form v-if="activeTab === 'profil'" @submit.prevent="saveProfile" style="max-width:480px">
        <div class="form-group foto-section">
          <label>Foto Profil</label>
          <div class="foto-upload">
            <div class="foto-preview" @click="triggerFileInput">
              <img v-if="fotoPreview" :src="fotoPreview" class="preview-img" />
              <img v-else-if="auth.user?.foto" :src="auth.user.foto" class="preview-img" />
              <div v-else class="preview-placeholder">
                <svg viewBox="0 0 20 20" width="32" height="32" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
              </div>
              <div class="foto-overlay">
                <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
                <span>{{ uploading ? 'Mengupload...' : 'Ganti Foto' }}</span>
              </div>
            </div>
            <div class="foto-info">
              <p class="foto-label">Foto profil Anda</p>
              <p class="foto-hint">Format: JPG, PNG, GIF, WebP. Maks: 2MB</p>
              <input
                id="foto-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style="display:none"
                @change="previewBeforeUpload($event); onFileSelected($event)"
              />
              <button type="button" class="btn btn-outline btn-sm" @click="triggerFileInput" :disabled="uploading">
                {{ uploading ? 'Mengupload...' : 'Pilih Foto' }}
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Nama Lengkap</label>
          <input v-model="profileForm.name" class="form-input" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="profileForm.email" type="email" class="form-input" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>

      <form v-if="activeTab === 'password'" @submit.prevent="savePassword" style="max-width:480px">
        <div class="form-group">
          <label>Password Saat Ini</label>
          <input v-model="passwordForm.current" type="password" class="form-input" required />
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <input v-model="passwordForm.new" type="password" class="form-input" minlength="6" required />
        </div>
        <div class="form-group">
          <label>Konfirmasi Password Baru</label>
          <input v-model="passwordForm.confirm" type="password" class="form-input" minlength="6" required />
        </div>
        <p v-if="passwordForm.new && passwordForm.confirm && passwordForm.new !== passwordForm.confirm" style="font-size:13px;color:var(--danger);margin-bottom:12px;">Password tidak cocok</p>
        <button type="submit" class="btn btn-primary">Ubah Password</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex; gap: 0; margin-bottom: 24px;
  border-bottom: 2px solid var(--gray-200);
}
.tab-btn {
  padding: 10px 20px; background: none; border: none;
  font-size: 14px; font-weight: 500; color: var(--gray-500);
  cursor: pointer; position: relative; transition: all 0.15s;
}
.tab-btn:hover { color: var(--gray-700); }
.tab-btn.active { color: var(--teal); font-weight: 600; }
.tab-btn.active::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
  height: 2px; background: var(--teal); border-radius: 1px;
}
.foto-section { margin-bottom: 24px; }
.foto-upload { display: flex; gap: 16px; align-items: flex-start; }
.foto-preview {
  position: relative; width: 96px; height: 96px; border-radius: 50%;
  overflow: hidden; cursor: pointer; flex-shrink: 0;
  border: 2px dashed var(--gray-300); background: var(--gray-50);
  display: flex; align-items: center; justify-content: center;
}
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.preview-placeholder { color: var(--gray-400); }
.foto-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  background: rgba(0,0,0,0.5); color: white; font-size: 10px;
  opacity: 0; transition: opacity 0.2s;
}
.foto-preview:hover .foto-overlay { opacity: 1; }
.foto-info { display: flex; flex-direction: column; gap: 4px; }
.foto-label { font-size: 13px; font-weight: 500; color: var(--gray-700); margin: 0; }
.foto-hint { font-size: 11px; color: var(--gray-400); margin: 0; }
.btn-sm { padding: 6px 14px; font-size: 12px; align-self: flex-start; }
</style>
