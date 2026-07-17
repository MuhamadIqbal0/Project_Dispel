<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const ok = await auth.login(email.value, password.value)
    if (ok) {
      if (auth.isAdmin) router.push('/')
      else router.push('/pt')
    } else {
      error.value = 'Email atau password salah!'
    }
  } catch {
    error.value = 'Gagal terhubung ke server'
  }
  loading.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-badge">S</div>
        <h1 class="logo">SistemPelporanPMI</h1>
        <p class="tagline">Sistem Informasi Pelaporan Data PMI</p>
        <p class="subtag">Disnakertrans Lombok Tengah</p>
      </div>

      <p v-if="error" class="msg-error">{{ error }}</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" class="form-input" placeholder="admin@disnakertrans.go.id" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="password-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Password"
              required
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
              <svg v-else viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <svg v-if="loading" class="spin" viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M4 10a6 6 0 0112 0 1 1 0 11-2 0 4 4 0 10-8 0 1 1 0 01-2 0z" clip-rule="evenodd"/></svg>
          {{ loading ? 'Memproses...' : 'Masuk ke Sistem' }}
          <span v-if="!loading">&rarr;</span>
        </button>
      </form>

      <div class="login-footer">
        <p class="demo-title">Akun Demo</p>
        <div class="demo-accounts">
          <div class="demo-item"><span class="demo-dot admin"></span><strong>Admin:</strong> admin@disnakertrans.go.id / admin123</div>
          <div class="demo-item"><span class="demo-dot pt"></span><strong>PT:</strong> pt.binakarya@mail.com / pt123</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 60%, var(--navy-light) 100%);
  padding: 20px;
}
.login-card {
  background: var(--white); border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  width: 100%; max-width: 420px; padding: 40px;
}
.login-header { text-align: center; margin-bottom: 28px; }
.logo-badge {
  width: 48px; height: 48px; border-radius: 12px;
  background: var(--teal); color: white;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 24px; margin-bottom: 16px;
}
.logo { font-size: 28px; font-weight: 700; color: var(--navy); margin: 0 0 8px; }
.tagline { font-size: 15px; color: var(--gray-600); }
.subtag { font-size: 13px; color: var(--gray-400); margin-top: 2px; }

.login-form { display: flex; flex-direction: column; gap: 6px; }

.password-wrap { position: relative; }
.password-wrap .form-input { padding-right: 40px; }
.eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--gray-400); cursor: pointer;
  padding: 4px; display: flex; transition: color 0.15s;
}
.eye-btn:hover { color: var(--gray-600); }

.login-btn { width: 100%; justify-content: center; margin-top: 8px; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.login-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--gray-200); }
.demo-title { font-size: 11px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
.demo-accounts { display: flex; flex-direction: column; gap: 6px; }
.demo-item {
  font-size: 12px; color: var(--gray-500);
  padding: 8px 12px; background: var(--gray-50);
  border-radius: 8px; display: flex; align-items: center; gap: 8px;
}
.demo-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.demo-dot.admin { background: var(--navy); }
.demo-dot.pt { background: var(--teal); }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
