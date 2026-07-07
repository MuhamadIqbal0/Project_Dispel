<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useLaporanStore } from '../../stores/laporan'

const router = useRouter()
const auth = useAuthStore()
const store = useLaporanStore()

const step = ref(1)
const periode = ref('')
const jumlah = ref('')
const negara = ref('')
const file = ref(null)
const error = ref('')
const success = ref(false)

const negaraOptions = ['Malaysia', 'Taiwan', 'Hong Kong', 'Korea Selatan', 'Jepang', 'Singapore', 'Brunei Darussalam']

function handleFile(e) { file.value = e.target.files[0] || null }

async function submit() {
  error.value = ''
  success.value = false

  if (!periode.value || !jumlah.value || !negara.value) {
    error.value = 'Semua field harus diisi!'
    return
  }

  try {
    await store.uploadLaporan({
      perusahaan: auth.user.name,
      periode: periode.value,
      jumlah: parseInt(jumlah.value),
      negara: negara.value,
      file: file.value?.name || '',
    })

    success.value = true
    periode.value = ''
    jumlah.value = ''
    negara.value = ''
    file.value = null
    step.value = 1

    setTimeout(() => router.push('/pt'), 1500)
  } catch {
    error.value = 'Gagal upload laporan'
  }
}
</script>

<template>
  <div>
    <h2 class="page-title">Upload Laporan</h2>

    <div class="card" style="max-width: 680px">
      <div class="stepper">
        <div class="step" :class="{ active: step >= 1, done: step > 1 }">
          <div class="step-circle">1</div>
          <span class="step-label">Data Laporan</span>
        </div>
        <div class="step-line" :class="{ active: step > 1 }"></div>
        <div class="step" :class="{ active: step >= 2, done: step > 2 }">
          <div class="step-circle">2</div>
          <span class="step-label">Upload Berkas</span>
        </div>
        <div class="step-line" :class="{ active: step > 2 }"></div>
        <div class="step" :class="{ active: step >= 3, done: step > 3 }">
          <div class="step-circle">3</div>
          <span class="step-label">Konfirmasi</span>
        </div>
      </div>

      <form @submit.prevent="submit">
        <div v-if="step === 1">
          <div class="form-group">
            <label>Periode Laporan</label>
            <input v-model="periode" type="month" class="form-input" required />
          </div>
          <div class="form-group">
            <label>Jumlah CPMI Berangkat</label>
            <input v-model.number="jumlah" type="number" class="form-input" min="1" placeholder="Contoh: 25" required />
          </div>
          <div class="form-group">
            <label>Negara Tujuan</label>
            <select v-model="negara" class="form-input" required>
              <option value="" disabled>Pilih negara tujuan</option>
              <option v-for="o in negaraOptions" :key="o" :value="o">{{ o }}</option>
            </select>
          </div>
        </div>

        <div v-if="step === 2">
          <div class="form-group">
            <label>File Data CPMI</label>
            <div class="file-input-wrap">
              <input type="file" id="file" accept=".pdf,.xls,.xlsx,.csv" @change="handleFile" hidden />
              <label for="file" class="file-input-label">
                <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
                {{ file ? file.name : 'Pilih file...' }}
              </label>
            </div>
            <p style="font-size:12px;color:var(--gray-400);margin-top:4px;">Format: PDF, Excel (.xls, .xlsx), CSV. Maksimal 10MB.</p>
          </div>
        </div>

        <div v-if="step === 3">
          <div class="confirm-box">
            <h4>Preview Data Laporan</h4>
            <table class="table">
              <tbody>
                <tr><td style="width:140px;font-weight:500">Periode</td><td>{{ periode }}</td></tr>
                <tr><td style="font-weight:500">Jumlah CPMI</td><td>{{ jumlah }} orang</td></tr>
                <tr><td style="font-weight:500">Negara Tujuan</td><td>{{ negara }}</td></tr>
                <tr><td style="font-weight:500">Berkas</td><td>{{ file?.name || '-' }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <p v-if="error" class="msg-error">{{ error }}</p>
        <p v-if="success" class="msg-success">Laporan berhasil diupload! Mengarahkan ke dashboard...</p>

        <div class="form-actions">
          <button v-if="step > 1" type="button" class="btn btn-outline" @click="step--">Batal</button>
          <button v-if="step < 3" type="button" class="btn btn-teal" @click="step++">
            Lanjutkan <span style="margin-left:4px">&rarr;</span>
          </button>
          <button v-else type="submit" class="btn btn-success">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
            Kirim Laporan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.stepper {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 32px; gap: 0;
}
.step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.step-circle {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
  background: var(--gray-100); color: var(--gray-400); border: 2px solid var(--gray-200);
  transition: all 0.2s;
}
.step.active .step-circle { background: var(--navy); color: white; border-color: var(--navy); }
.step.done .step-circle { background: var(--teal); color: white; border-color: var(--teal); }
.step-label { font-size: 12px; color: var(--gray-400); font-weight: 500; }
.step.active .step-label { color: var(--navy); font-weight: 600; }
.step.done .step-label { color: var(--teal); }

.step-line {
  width: 60px; height: 2px; background: var(--gray-200); margin: 0 8px;
  margin-bottom: 24px; transition: background 0.2s;
}
.step-line.active { background: var(--teal); }

.file-input-label {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border: 2px dashed var(--gray-300);
  border-radius: var(--radius); cursor: pointer;
  font-size: 14px; color: var(--gray-500); transition: all 0.15s;
}
.file-input-label:hover { border-color: var(--teal); color: var(--teal); background: rgba(13,148,136,0.04); }

.confirm-box {
  background: var(--gray-50); border-radius: var(--radius);
  padding: 20px; margin-bottom: 20px;
}
.confirm-box h4 { font-size: 15px; font-weight: 600; margin-bottom: 16px; color: var(--gray-800); }
.confirm-box .table td { border-bottom: none; padding: 8px 12px; }

.form-actions {
  display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;
}
</style>
