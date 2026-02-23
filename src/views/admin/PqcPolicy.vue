<template>
  <div>
    <div class="page-header">
      <h2>PQC 策略配置</h2>
      <p>查看与更新系统后量子密码学策略 — 控制默认算法、安全等级与自动过期时间</p>
    </div>

    <el-card v-loading="fetchLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSave"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="策略名称" prop="name">
            <el-input v-model="form.name" placeholder="策略名称" />
          </el-form-item>

          <el-form-item label="启用状态" prop="enabled">
            <el-switch
              v-model="form.enabled"
              active-text="已启用"
              inactive-text="已禁用"
              inline-prompt
              size="large"
            />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="默认 PQC 算法" prop="pqcAlg">
            <el-select v-model="form.pqcAlg" placeholder="选择默认算法" class="w-full">
              <el-option-group label="签名算法">
                <el-option label="ML-DSA-44" value="ML-DSA-44" />
                <el-option label="ML-DSA-65" value="ML-DSA-65" />
                <el-option label="ML-DSA-87" value="ML-DSA-87" />
              </el-option-group>
              <el-option-group label="加密算法">
                <el-option label="ML-KEM-512" value="ML-KEM-512" />
                <el-option label="ML-KEM-768" value="ML-KEM-768" />
                <el-option label="ML-KEM-1024" value="ML-KEM-1024" />
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item label="安全等级" prop="securityLevel">
            <el-select v-model="form.securityLevel" class="w-full">
              <el-option label="Level 1 (AES-128 等效)" value="LEVEL_1" />
              <el-option label="Level 3 (AES-192 等效)" value="LEVEL_3" />
              <el-option label="Level 5 (AES-256 等效)" value="LEVEL_5" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="额外参数 (JSON)" prop="paramsJson">
          <el-input
            v-model="form.paramsJson"
            type="textarea"
            :rows="4"
            placeholder='{"autoExpireDays": 365, "keyRotationDays": 90}'
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave" size="large">
            <el-icon class="mr-1"><Check /></el-icon>
            保存配置
          </el-button>
          <el-button @click="fetchPolicy" size="large">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重新加载
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Check, Refresh } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getPqcPolicy, updatePqcPolicy } from '@/api/admin'
import type { PqcPolicy } from '@/types'

const formRef = ref<FormInstance>()
const fetchLoading = ref(false)
const saving = ref(false)

const form = reactive<PqcPolicy>({
  name: '',
  enabled: true,
  pqcAlg: 'ML-DSA-65',
  securityLevel: 'LEVEL_3',
  paramsJson: '',
  version: 0,
})

const rules: FormRules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  pqcAlg: [{ required: true, message: '请选择算法', trigger: 'change' }],
  securityLevel: [{ required: true, message: '请选择安全等级', trigger: 'change' }],
}

async function fetchPolicy() {
  fetchLoading.value = true
  try {
    const data = await getPqcPolicy()
    Object.assign(form, data)
  } catch {
    // handled
  } finally {
    fetchLoading.value = false
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await updatePqcPolicy({ ...form })
    ElMessage.success('PQC 策略已更新')
    await fetchPolicy()
  } catch {
    // handled
  } finally {
    saving.value = false
  }
}

// 不再自动加载 — 用户点击"重新加载"按钮手动拉取数据，避免后端未就绪时弹出错误
// onMounted(() => { fetchPolicy() })
</script>
