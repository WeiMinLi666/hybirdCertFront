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
          <el-button type="primary" :loading="verifyLoading" @click="handleVerify" size="large">
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

    <!-- 对象失效区域 -->
    <div class="section-header mt-10 mb-4">
      <span class="section-dot danger"></span>
      <span class="section-title">对象失效 &amp; 联动吊销</span>
    </div>

    <el-card>
      <div class="danger-notice mb-5">
        <el-icon class="danger-notice-icon"><WarningFilled /></el-icon>
        <span>危险操作：使 Sidecar 对象失效后，系统将自动吊销所有引用该对象的证书并发布新的 CRL，此操作不可逆。</span>
      </div>
      <el-form
        ref="invalidateFormRef"
        :model="invalidateForm"
        :rules="invalidateRules"
        label-position="top"
        @submit.prevent="handleInvalidate"
      >
        <el-form-item label="Object ID" prop="objectId">
          <el-input v-model="invalidateForm.objectId" placeholder="要失效的 Sidecar 对象 ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="danger" :loading="invalidateLoading" @click="handleInvalidate" size="large">
            <el-icon class="mr-1"><Delete /></el-icon>
            使对象失效
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 失效结果 -->
    <transition name="fade-slide">
      <el-card v-if="invalidateResult !== null" class="mt-6 result-card">
        <div class="result-header" :class="invalidateResult ? 'result-success' : 'result-error'">
          <span class="result-icon">{{ invalidateResult ? '🗑️' : '❌' }}</span>
          <span class="result-title">{{ invalidateResult ? '对象已失效' : '操作失败' }}</span>
        </div>
        <p class="result-subtitle">
          {{ invalidateResult
            ? `对象 ${lastInvalidateId} 已被标记为 DELETED，关联证书已自动吊销，CRL 已发布。`
            : `对象 ${lastInvalidateId} 失效操作失败，请检查 ID 是否正确。` }}
        </p>
        <el-descriptions :column="1" border class="mt-4">
          <el-descriptions-item label="Object ID">
            <code class="text-cyan-400">{{ lastInvalidateId }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="操作结果">
            <el-tag :type="invalidateResult ? 'danger' : 'info'" effect="dark">
              {{ invalidateResult ? 'DELETED' : 'FAILED' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CircleCheck, Delete, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { verifySidecarObject, deleteSidecarObject } from '@/api/sidecar'
import type { SidecarVerifyResult } from '@/types'

// ---- 验证 ----
const formRef = ref<FormInstance>()
const verifyLoading = ref(false)
const verifyResult = ref<SidecarVerifyResult | null>(null)
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

  verifyLoading.value = true
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
    verifyLoading.value = false
  }
}

// ---- 失效 ----
const invalidateFormRef = ref<FormInstance>()
const invalidateLoading = ref(false)
const invalidateResult = ref<boolean | null>(null)
const lastInvalidateId = ref('')

const invalidateForm = reactive({
  objectId: '',
})

const invalidateRules: FormRules = {
  objectId: [{ required: true, message: '请输入要失效的 Object ID', trigger: 'blur' }],
}

async function handleInvalidate() {
  const valid = await invalidateFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await ElMessageBox.confirm(
      `确认使对象 ${invalidateForm.objectId} 失效？此操作将自动吊销所有关联证书并发布 CRL，不可撤销。`,
      '危险操作确认',
      { type: 'warning', confirmButtonText: '确认失效', cancelButtonText: '取消' },
    )
  } catch {
    return
  }

  invalidateLoading.value = true
  try {
    lastInvalidateId.value = invalidateForm.objectId
    await deleteSidecarObject(invalidateForm.objectId)
    invalidateResult.value = true
    ElMessage.success('对象已失效，关联证书已自动吊销')
  } catch {
    invalidateResult.value = false
    ElMessage.error('对象失效操作失败')
  } finally {
    invalidateLoading.value = false
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

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.section-dot.danger {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.5px;
}

.danger-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  font-size: 13px;
  line-height: 1.6;
}

.danger-notice-icon {
  color: #ef4444;
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}
</style>
