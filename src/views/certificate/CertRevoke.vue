<template>
  <div>
    <div class="page-header">
      <h2>证书吊销</h2>
      <p>输入证书序列号，执行吊销操作</p>
    </div>

    <el-card>
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
          />
        </el-form-item>

        <el-form-item label="吊销原因" prop="revokeReason">
          <el-select v-model="form.revokeReason" placeholder="选择吊销原因" class="w-full">
            <el-option label="密钥泄露 (Key Compromise)" value="KEY_COMPROMISE" />
            <el-option label="CA 泄露 (CA Compromise)" value="CA_COMPROMISE" />
            <el-option label="从属关系变更 (Affiliation Changed)" value="AFFILIATION_CHANGED" />
            <el-option label="已被替代 (Superseded)" value="SUPERSEDED" />
            <el-option label="停止运营 (Cessation of Operation)" value="CESSATION_OF_OPERATION" />
            <el-option label="证书挂起 (Certificate Hold)" value="CERTIFICATE_HOLD" />
            <el-option label="未指定 (Unspecified)" value="UNSPECIFIED" />
          </el-select>
        </el-form-item>

        <el-form-item>
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
