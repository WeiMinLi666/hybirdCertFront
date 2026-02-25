<template>
  <div>
    <div class="page-header">
      <h2>Sidecar 防篡改验证</h2>
      <p>输入 Object ID 和预期 Root Hash，对存储的大对象进行完整性校验</p>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleVerify"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="Object ID" prop="objectId">
            <el-input v-model="form.objectId" placeholder="Sidecar 对象 ID" />
          </el-form-item>
          <el-form-item label="预期 Root Hash" prop="rootHash">
            <el-input v-model="form.rootHash" placeholder="Merkle Tree Root Hash" />
          </el-form-item>
        </div>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleVerify" size="large">
            <el-icon class="mr-1"><CircleCheck /></el-icon>
            验证完整性
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 验证结果 -->
    <transition name="fade-slide">
      <el-card v-if="verifyResult !== null" class="mt-6 result-card">
        <div class="result-header" :class="verifyResult.verified ? 'result-success' : 'result-error'">
          <span class="result-icon">{{ verifyResult.verified ? '✅' : '❌' }}</span>
          <span class="result-title">{{ verifyResult.verified ? '完整性验证通过' : '完整性验证失败' }}</span>
        </div>
        <p class="result-subtitle">
          {{ verifyResult.verified
            ? `对象 ${lastObjectId} 的 Merkle Root Hash 匹配成功，数据未被篡改`
            : `对象 ${lastObjectId} 的 Hash 不匹配，数据可能已被篡改！` }}
        </p>
        <el-descriptions :column="1" border class="mt-4">
          <el-descriptions-item label="Object ID">
            <code class="text-cyan-400">{{ lastObjectId }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="Root Hash">
            <code class="text-xs text-slate-200">{{ lastRootHash }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="验证状态">
            <el-tag :type="verifyResult.verified ? 'success' : 'danger'" effect="dark">
              {{ verifyResult.verified ? 'VALID' : 'INVALID' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { verifySidecarObject } from '@/api/sidecar'
import type { SidecarVerifyResult } from '@/types'

const formRef = ref<FormInstance>()
const loading = ref(false)
const verifyResult = ref<SidecarVerifyResult | null>(null)
// 保存最后一次提交的表单值用于结果显示（后端只返回 verified 字段）
const lastObjectId = ref('')
const lastRootHash = ref('')

const form = reactive({
  objectId: '',
  rootHash: '',
})

const rules: FormRules = {
  objectId: [{ required: true, message: '请输入 Object ID', trigger: 'blur' }],
  rootHash: [{ required: true, message: '请输入 Root Hash', trigger: 'blur' }],
}

async function handleVerify() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    lastObjectId.value = form.objectId
    lastRootHash.value = form.rootHash
    verifyResult.value = await verifySidecarObject(form.objectId, form.rootHash)
    ElMessage[verifyResult.value.verified ? 'success' : 'error'](
      verifyResult.value.verified ? '完整性验证通过' : '完整性验证失败',
    )
  } catch {
    verifyResult.value = null
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.result-success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.result-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.result-icon {
  font-size: 28px;
}

.result-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
}

.result-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 4px 0;
  padding: 0 4px;
}
</style>
