<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

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

function saveProfile() {
  successMsg.value = 'Profil berhasil diperbarui'
  setTimeout(() => successMsg.value = '', 3000)
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

      <form v-if="activeTab === 'profil'" @submit.prevent="saveProfile" style="max-width:480px">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input v-model="profileForm.name" class="form-input" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="profileForm.email" type="email" class="form-input" required />
        </div>
        <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
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
</style>
