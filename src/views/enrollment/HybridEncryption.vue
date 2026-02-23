<template>
  <div>
    <div class="page-header">
      <h2>混合加密证书申请</h2>
      <p>一键申请 PQC 加密证书 — 系统自动生成密钥并通过 KMC 下发密钥信封</p>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="申请主体编码 (Principal Code)" prop="principalCode">
            <el-input v-model="form.principalCode" placeholder="设备/主体唯一编码" />
          </el-form-item>

          <el-form-item label="目标主体 ID (Target Principal)" prop="targetPrincipalId">
            <el-input v-model="form.targetPrincipalId" placeholder="目标通信方主体编码" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="PQC 加密算法" prop="pqcAlg">
            <el-select v-model="form.pqcAlg" placeholder="选择后量子加密算法" class="w-full">
              <el-option label="ML-KEM-512 (Kyber512)" value="ML-KEM-512" />
              <el-option label="ML-KEM-768 (Kyber768)" value="ML-KEM-768" />
              <el-option label="ML-KEM-1024 (Kyber1024)" value="ML-KEM-1024" />
            </el-select>
          </el-form-item>

          <el-form-item label="随机数 (Nonce)" prop="nonce">
            <div class="flex gap-2 w-full">
              <el-input v-model="form.nonce" placeholder="防重放随机数" />
              <el-button @click="generateNonce" type="info" plain>
                <el-icon class="mr-1"><Refresh /></el-icon>
                生成
              </el-button>
            </div>
          </el-form-item>
        </div>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit" size="large">
            <el-icon class="mr-1"><Lock /></el-icon>
            一键申请加密证书
          </el-button>
          <el-button @click="resetForm" size="large">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请结果 -->
    <transition name="fade-slide">
      <div v-if="result" class="mt-6 space-y-6">
        <!-- 证书 PEM -->
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">🔏 签发证书</span>
              <el-button size="small" text @click="copyPem">
                <el-icon class="mr-1"><CopyDocument /></el-icon>
                复制 PEM
              </el-button>
            </div>
          </template>
          <el-descriptions :column="1" border class="mb-4">
            <el-descriptions-item label="请求 ID">
              <el-tag effect="dark">{{ result.requestId }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success" effect="dark">{{ result.status }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <pre class="pem-block">{{ result.certificatePem }}</pre>
        </el-card>

        <!-- KMC 密钥下发信封 -->
        <el-card>
          <template #header>
            <span class="font-semibold">📦 KMC 密钥下发信封</span>
          </template>
          <el-alert
            title="密钥信封已通过 KMC 分发，请通过以下 Sidecar URL 获取"
            type="info"
            :closable="false"
            show-icon
            class="mb-4"
          />
          <div class="kmc-url-box">
            <span class="kmc-url-label">Distribution URL</span>
            <div class="kmc-url-value">
              <code>{{ result.kmcDistributionUrl }}</code>
              <el-button size="small" text @click="copyUrl">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Lock, Refresh, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { enrollEncryption } from '@/api/enroll'
import type { EnrollEncryptionReq, EnrollEncryptionRes } from '@/types'

const formRef = ref<FormInstance>()
const loading = ref(false)
const result = ref<EnrollEncryptionRes | null>(null)

const form = reactive<EnrollEncryptionReq>({
  principalCode: '',
  targetPrincipalId: '',
  pqcAlg: 'ML-KEM-768',
  nonce: '',
})

const rules: FormRules = {
  principalCode: [{ required: true, message: '必填', trigger: 'blur' }],
  targetPrincipalId: [{ required: true, message: '必填', trigger: 'blur' }],
  pqcAlg: [{ required: true, message: '请选择算法', trigger: 'change' }],
  nonce: [{ required: true, message: '必填', trigger: 'blur' }],
}

function generateNonce() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  form.nonce = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    result.value = await enrollEncryption({ ...form })
    ElMessage.success('加密证书签发成功！')
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function copyPem() {
  if (result.value?.certificatePem) {
    navigator.clipboard.writeText(result.value.certificatePem)
    ElMessage.success('已复制 PEM 到剪贴板')
  }
}

function copyUrl() {
  if (result.value?.kmcDistributionUrl) {
    navigator.clipboard.writeText(result.value.kmcDistributionUrl)
    ElMessage.success('已复制 URL 到剪贴板')
  }
}

function resetForm() {
  formRef.value?.resetFields()
  result.value = null
}
</script>

<style scoped>
.pem-block {
  background: #0f172a;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #10b981;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.kmc-url-box {
  background: #0f172a;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 16px 20px;
}

.kmc-url-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.kmc-url-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.kmc-url-value code {
  font-family: 'JetBrains Mono', monospace;
  color: #06b6d4;
  font-size: 13px;
  word-break: break-all;
}
</style>
