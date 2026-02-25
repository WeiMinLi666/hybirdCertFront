<template>
  <div class="cert-revoke-page">
    <div class="page-header">
      <h2>证书吊销</h2>
      <p>输入证书序列号，执行吊销操作</p>
    </div>

    <el-card class="revoke-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleRevoke"
      >
        <el-form-item label="证书序列号" prop="serial">
          <el-input
            v-model="form.serial"
            placeholder="输入要吊销的证书序列号"
            size="large"
          />
        </el-form-item>

        <el-form-item label="吊销原因" prop="revokeReason">
          <el-select
            v-model="form.revokeReason"
            placeholder="选择吊销原因"
            class="w-full revoke-select"
            size="large"
          >
            <el-option label="密钥泄露 (Key Compromise)" value="KEY_COMPROMISE" />
            <el-option label="CA 泄露 (CA Compromise)" value="CA_COMPROMISE" />
            <el-option label="从属关系变更 (Affiliation Changed)" value="AFFILIATION_CHANGED" />
            <el-option label="已被替代 (Superseded)" value="SUPERSEDED" />
            <el-option label="停止运营 (Cessation of Operation)" value="CESSATION_OF_OPERATION" />
            <el-option label="证书挂起 (Certificate Hold)" value="CERTIFICATE_HOLD" />
            <el-option label="未指定 (Unspecified)" value="UNSPECIFIED" />
          </el-select>
        </el-form-item>

        <el-form-item class="mt-2">
          <el-popconfirm
            title="确认吊销此证书？此操作不可撤销！"
            confirm-button-text="确认吊销"
            cancel-button-text="取消"
            confirm-button-type="danger"
            @confirm="handleRevoke"
            width="280"
          >
            <template #reference>
              <el-button type="danger" :loading="loading" size="large">
                <el-icon class="mr-1"><CircleClose /></el-icon>
                吊销证书
              </el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 吊销成功 -->
    <transition name="fade-slide">
      <el-card v-if="revoked" class="mt-6">
        <el-result
          icon="success"
          title="证书已成功吊销"
          :sub-title="`序列号 ${form.serial} 已被标记为吊销，原因：${form.revokeReason}`"
        >
          <template #extra>
            <el-button type="primary" @click="reset">吊销另一张证书</el-button>
          </template>
        </el-result>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CircleClose } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { revokeCertificate } from '@/api/ca'

const formRef = ref<FormInstance>()
const loading = ref(false)
const revoked = ref(false)

const form = reactive({
  serial: '',
  revokeReason: 'KEY_COMPROMISE',
})

const rules: FormRules = {
  serial: [{ required: true, message: '请输入证书序列号', trigger: 'blur' }],
  revokeReason: [{ required: true, message: '请选择吊销原因', trigger: 'change' }],
}

async function handleRevoke() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await revokeCertificate(form.serial, { revokeReason: form.revokeReason })
    revoked.value = true
    ElMessage.success('证书吊销成功')
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

function reset() {
  formRef.value?.resetFields()
  revoked.value = false
}
</script>

<style scoped>
/* ── 表单标签 ─────────────────────────────── */
:deep(.el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.03em;
}

/* ── 必填星号 ────────────────────────────── */
:deep(.el-form-item__label::before) {
  color: #f87171 !important;
}

/* ── 输入框：背景 / 边框 / 文字 ─────────── */
:deep(.el-input__wrapper) {
  background-color: #1e293b !important;
  box-shadow: 0 0 0 1px #334155 inset !important;
  border-radius: 8px;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #6366f1 inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1 inset !important;
}
:deep(.el-input__inner) {
  color: #f1f5f9 !important;
  font-size: 14px;
}
:deep(.el-input__inner::placeholder) {
  color: #94a3b8 !important;
}

/* ── Select：使用 EP CSS 变量覆盖深色主题 ── */
:deep(.el-select) {
  --el-fill-color-blank: #1e293b;
  --el-text-color-regular: #f1f5f9;
  --el-text-color-placeholder: #94a3b8;
  --el-border-color: #334155;
  --el-border-color-hover: #6366f1;
  --el-color-white: #1e293b;
}

/* ── Select 下拉箭头 ──────────────────────── */
:deep(.el-select .el-icon) {
  color: #94a3b8;
}
:deep(.el-select__selected-item) {
  color: #f1f5f9 !important;
}
</style>
