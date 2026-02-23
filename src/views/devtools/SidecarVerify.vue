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
      <el-card v-if="verifyResult !== null" class="mt-6">
        <el-result
          :icon="verifyResult.valid ? 'success' : 'error'"
          :title="verifyResult.valid ? '✅ 完整性验证通过' : '❌ 完整性验证失败'"
          :sub-title="verifyResult.valid
            ? `对象 ${verifyResult.objectId} 的 Merkle Root Hash 匹配成功`
            : `对象 ${verifyResult.objectId} 的 Hash 不匹配，数据可能已被篡改`"
        >
          <template #extra>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Object ID">
                <code class="text-cyan-400">{{ verifyResult.objectId }}</code>
              </el-descriptions-item>
              <el-descriptions-item label="Root Hash">
                <code class="text-xs">{{ verifyResult.rootHash }}</code>
              </el-descriptions-item>
              <el-descriptions-item label="验证状态">
                <el-tag :type="verifyResult.valid ? 'success' : 'danger'" effect="dark">
                  {{ verifyResult.valid ? 'VALID' : 'INVALID' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-result>
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
    verifyResult.value = await verifySidecarObject(form.objectId, form.rootHash)
    ElMessage[verifyResult.value.valid ? 'success' : 'error'](
      verifyResult.value.valid ? '完整性验证通过' : '完整性验证失败',
    )
  } catch {
    verifyResult.value = null
  } finally {
    loading.value = false
  }
}
</script>
