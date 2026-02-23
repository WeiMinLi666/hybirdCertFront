<template>
  <div>
    <div class="page-header">
      <h2>标准国密证书申请</h2>
      <p>提交 SM2 CSR 进行传统国密证书签发</p>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="申请主体编码 (Principal Code)" prop="principalCode">
          <el-input
            v-model="form.principalCode"
            placeholder="请输入设备/主体唯一编码"
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

    <!-- 申请结果 -->
    <el-card v-if="result" class="mt-6">
      <template #header>
        <span class="font-semibold">✅ 申请结果</span>
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
        <el-descriptions-item label="消息">{{ result.message }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Refresh, Upload } from '@element-plus/icons-vue'
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
  csrPem: [{ required: true, message: '请输入 CSR PEM', trigger: 'blur' }],
  nonce: [{ required: true, message: '请输入或生成 Nonce', trigger: 'blur' }],
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
    ElMessage.success('申请已提交！')
  } catch {
    // 全局拦截器已处理错误提示
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
  result.value = null
}
</script>
