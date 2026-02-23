<template>
  <div>
    <div class="page-header">
      <h2>Sidecar 存储配置</h2>
      <p>管理分布式大对象存储提供商、Bucket 及哈希算法配置</p>
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
          <el-form-item label="存储提供商 (Provider)" prop="storageProvider">
            <el-select v-model="form.storageProvider" class="w-full">
              <el-option label="MinIO" value="MINIO" />
              <el-option label="AWS S3" value="AWS_S3" />
              <el-option label="Aliyun OSS" value="ALIYUN_OSS" />
              <el-option label="Local Filesystem" value="LOCAL_FS" />
            </el-select>
          </el-form-item>

          <el-form-item label="Bucket 名称" prop="bucket">
            <el-input v-model="form.bucket" placeholder="存储桶名称" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-6">
          <el-form-item label="URL TTL (秒)" prop="urlTtlSeconds">
            <el-input-number
              v-model="form.urlTtlSeconds"
              :min="60"
              :max="86400"
              :step="60"
              class="w-full"
            />
          </el-form-item>

          <el-form-item label="哈希算法" prop="hashAlg">
            <el-select v-model="form.hashAlg" class="w-full">
              <el-option label="SM3" value="SM3" />
              <el-option label="SHA-256" value="SHA-256" />
              <el-option label="SHA-512" value="SHA-512" />
              <el-option label="SHA3-256" value="SHA3-256" />
            </el-select>
          </el-form-item>

          <el-form-item label="版本号" prop="version">
            <el-input-number v-model="form.version" :min="0" disabled class="w-full" />
          </el-form-item>
        </div>

        <el-form-item label="Merkle 参数 (JSON)" prop="merkleParams">
          <el-input
            v-model="form.merkleParams"
            type="textarea"
            :rows="3"
            placeholder='{"chunkSize": 4096, "hashFunction": "SM3"}'
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave" size="large">
            <el-icon class="mr-1"><Check /></el-icon>
            保存配置
          </el-button>
          <el-button @click="fetchConfig" size="large">
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
import { getSidecarConfig, updateSidecarConfig } from '@/api/admin'
import type { SidecarConfig } from '@/types'

const formRef = ref<FormInstance>()
const fetchLoading = ref(false)
const saving = ref(false)

const form = reactive<SidecarConfig>({
  storageProvider: 'MINIO',
  bucket: '',
  urlTtlSeconds: 3600,
  hashAlg: 'SM3',
  merkleParams: '',
  version: 0,
})

const rules: FormRules = {
  storageProvider: [{ required: true, message: '必填', trigger: 'change' }],
  bucket: [{ required: true, message: '必填', trigger: 'blur' }],
  hashAlg: [{ required: true, message: '必填', trigger: 'change' }],
}

async function fetchConfig() {
  fetchLoading.value = true
  try {
    const data = await getSidecarConfig()
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
    await updateSidecarConfig({ ...form })
    ElMessage.success('Sidecar 配置已更新')
    await fetchConfig()
  } catch {
    // handled
  } finally {
    saving.value = false
  }
}

// 不再自动加载 — 用户点击"重新加载"按钮手动拉取数据，避免后端未就绪时弹出错误
// onMounted(() => { fetchConfig() })
</script>
