<template>
  <div>
    <div class="page-header">
      <h2>标准国密证书申请</h2>
      <p>提交 SM2 CSR 进行传统国密证书签发</p>
    </div>

    <!-- 表单输入区 -->
    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="申请主体编码 (Principal Code)" prop="principalCode">
          <el-input
            v-model="form.principalCode"
            placeholder="请输入设备/主体唯一编码，如 DEVICE-A1B2C3D4"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="SM2 CSR (PEM 格式)" prop="csrPem">
          <el-input
            v-model="form.csrPem"
            type="textarea"
            :rows="8"
            placeholder="-----BEGIN CERTIFICATE REQUEST-----&#10;MIIBojCCAUcCAQAwXzELMAkGA1UE...&#10;-----END CERTIFICATE REQUEST-----"
          />
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

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit" size="large">
            <el-icon class="mr-1"><Upload /></el-icon>
            提交申请
          </el-button>
          <el-button @click="resetForm" size="large">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 签发成功结果 -->
    <el-card v-if="result && result.status === 'ISSUED'" class="mt-6">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="result-icon result-icon--success">✅</span>
          <span class="font-semibold">证书签发成功</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="请求 ID">
          <el-tag effect="dark">{{ result.requestId }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag type="success" effect="dark">{{ result.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 证书 PEM 展示 -->
      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-400">签发证书 PEM</span>
          <div class="flex gap-2">
            <el-button size="small" text @click="copyPem">
              <el-icon class="mr-1"><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" text @click="downloadPem">
              <el-icon class="mr-1"><Download /></el-icon>
              下载
            </el-button>
          </div>
        </div>
        <pre class="pem-block">{{ result.message }}</pre>
      </div>
    </el-card>

    <!-- 签发失败（REJECTED）结果 -->
    <el-card v-if="result && result.status === 'REJECTED'" class="mt-6">
      <template #header>
        <div class="flex items-center gap-2">
          <span class="result-icon result-icon--error">❌</span>
          <span class="font-semibold">证书签发被拒绝</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="请求 ID">
          <el-tag effect="dark">{{ result.requestId }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag type="danger" effect="dark">{{ result.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        class="mt-4"
        title="CSR 签名验证失败"
        description="提交的 SM2 CSR 签名验证未通过，请检查 CSR 的完整性及签名是否正确后重新提交。"
        type="error"
        show-icon
        :closable="false"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Refresh, Upload, CopyDocument, Download } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { enrollCsr } from '@/api/enroll'
import type { EnrollCsrReq, EnrollCsrRes } from '@/types'

const formRef = ref<FormInstance>()
const loading = ref(false)
const result = ref<EnrollCsrRes | null>(null)

const form = reactive<EnrollCsrReq>({
  principalCode: '',
  csrPem: '',
  nonce: '',
})

const rules: FormRules = {
  principalCode: [{ required: true, message: '请输入主体编码', trigger: 'blur' }],
  csrPem: [{ required: true, message: '请输入 SM2 CSR (PEM 格式)', trigger: 'blur' }],
  nonce: [{ required: true, message: '请输入或生成随机数 Nonce', trigger: 'blur' }],
}

function generateNonce() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  form.nonce = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    result.value = await enrollCsr({ ...form })
    if (result.value.status === 'ISSUED') {
      ElMessage.success('证书签发成功！')
    } else if (result.value.status === 'REJECTED') {
      ElMessage.warning('CSR 验签失败，证书签发被拒绝')
    }
  } catch {
    // 全局拦截器已处理错误提示
  } finally {
    loading.value = false
  }
}

function copyPem() {
  if (result.value?.message) {
    navigator.clipboard.writeText(result.value.message)
    ElMessage.success('证书 PEM 已复制到剪贴板')
  }
}

function downloadPem() {
  if (!result.value?.message) return
  const blob = new Blob([result.value.message], { type: 'application/x-pem-file' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `certificate-${result.value.requestId || 'cert'}.pem`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('证书文件已开始下载')
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

.result-icon {
  font-size: 18px;
}
</style>
