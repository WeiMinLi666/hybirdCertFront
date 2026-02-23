<template>
  <div>
    <div class="page-header">
      <h2>混合签名证书申请</h2>
      <p>提交 SM2 CSR + PQC 签名数据，申请 SM2/PQC 双签名混合证书</p>
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
          <el-form-item label="申请主体编码" prop="principalCode">
            <el-input v-model="form.principalCode" placeholder="设备/主体唯一编码" />
          </el-form-item>

          <el-form-item label="PQC 算法" prop="pqcAlg">
            <el-select v-model="form.pqcAlg" placeholder="选择后量子签名算法" class="w-full">
              <el-option label="ML-DSA-44 (Dilithium2)" value="ML-DSA-44" />
              <el-option label="ML-DSA-65 (Dilithium3)" value="ML-DSA-65" />
              <el-option label="ML-DSA-87 (Dilithium5)" value="ML-DSA-87" />
              <el-option label="SLH-DSA-SHA2-128s" value="SLH-DSA-SHA2-128s" />
              <el-option label="SLH-DSA-SHA2-256f" value="SLH-DSA-SHA2-256f" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="SM2 CSR (PEM 格式)" prop="csrPem">
          <el-input
            v-model="form.csrPem"
            type="textarea"
            :rows="6"
            placeholder="-----BEGIN CERTIFICATE REQUEST-----&#10;...&#10;-----END CERTIFICATE REQUEST-----"
          />
        </el-form-item>

        <el-form-item label="PQC 公钥 (Base64)" prop="pqcPublicKeyBase64">
          <el-input
            v-model="form.pqcPublicKeyBase64"
            type="textarea"
            :rows="4"
            placeholder="后量子签名算法的公钥 Base64 编码"
          />
        </el-form-item>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="SM2 签名" prop="sm2Signature">
            <el-input
              v-model="form.sm2Signature"
              type="textarea"
              :rows="3"
              placeholder="对 CSR 内容的 SM2 签名值"
            />
          </el-form-item>

          <el-form-item label="PQC 签名" prop="pqcSignature">
            <el-input
              v-model="form.pqcSignature"
              type="textarea"
              :rows="3"
              placeholder="对 CSR 内容的 PQC 签名值"
            />
          </el-form-item>
        </div>

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
            提交混合签名申请
          </el-button>
          <el-button @click="resetForm" size="large">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请结果 -->
    <el-card v-if="result" class="mt-6">
      <template #header>
        <span class="font-semibold">✅ 混合签名证书结果</span>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="请求 ID">
          <el-tag effect="dark">{{ result.requestId }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="result.status === 'COMPLETED' ? 'success' : 'warning'" effect="dark">
            {{ result.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 证书 PEM 原文 -->
      <div v-if="result.message && result.status === 'COMPLETED'" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-400">签发证书 PEM</span>
          <el-button size="small" text @click="copyPem">
            <el-icon class="mr-1"><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
        <pre class="pem-block">{{ result.message }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Refresh, Upload, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { enrollHybrid } from '@/api/enroll'
import type { EnrollHybridReq, EnrollHybridRes } from '@/types'

const formRef = ref<FormInstance>()
const loading = ref(false)
const result = ref<EnrollHybridRes | null>(null)

const form = reactive<EnrollHybridReq>({
  principalCode: '',
  csrPem: '',
  pqcAlg: 'ML-DSA-65',
  pqcPublicKeyBase64: '',
  pqcSignature: '',
  sm2Signature: '',
  nonce: '',
})

const rules: FormRules = {
  principalCode: [{ required: true, message: '必填', trigger: 'blur' }],
  csrPem: [{ required: true, message: '必填', trigger: 'blur' }],
  pqcAlg: [{ required: true, message: '请选择 PQC 算法', trigger: 'change' }],
  pqcPublicKeyBase64: [{ required: true, message: '必填', trigger: 'blur' }],
  pqcSignature: [{ required: true, message: '必填', trigger: 'blur' }],
  sm2Signature: [{ required: true, message: '必填', trigger: 'blur' }],
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
    result.value = await enrollHybrid({ ...form })
    ElMessage.success('混合签名证书申请已提交！')
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function copyPem() {
  if (result.value?.message) {
    navigator.clipboard.writeText(result.value.message)
    ElMessage.success('已复制到剪贴板')
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
</style>
