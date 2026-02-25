<template>
  <div>
    <div class="page-header">
      <h2>Sidecar 存储配置</h2>
      <p>管理 Sidecar 对象存储的桶名与预签名 URL 有效期</p>
    </div>

    <!-- 当前生效配置 -->
    <el-card v-loading="fetchLoading" class="mb-6">
      <template #header>
        <span class="font-semibold">当前生效配置</span>
      </template>

      <div v-if="activeConfig" class="config-info-grid">
        <div class="config-info-item">
          <span class="label">存储提供商</span>
          <code class="info-value">{{ activeConfig.storageProvider || 'MINIO' }}</code>
        </div>
        <div class="config-info-item">
          <span class="label">Bucket</span>
          <code class="info-value highlight">{{ activeConfig.bucket || '未设置' }}</code>
        </div>
        <div class="config-info-item">
          <span class="label">URL 有效期</span>
          <code class="info-value highlight">{{ formatTtl(activeConfig.urlTtlSeconds) }}</code>
        </div>
        <div class="config-info-item">
          <span class="label">哈希算法</span>
          <code class="info-value">{{ activeConfig.hashAlg || 'SM3' }}</code>
        </div>
        <div class="config-info-item">
          <span class="label">版本</span>
          <code class="info-value">v{{ activeConfig.version }}</code>
        </div>
      </div>
      <el-empty v-else description="暂无配置，请在下方创建" :image-size="60" />
    </el-card>

    <!-- 修改配置 -->
    <el-card>
      <template #header>
        <span class="font-semibold">更新配置</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSave"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="Bucket 名称" prop="bucket">
            <el-input v-model="form.bucket" placeholder="例：sidecar" />
            <div class="text-xs text-slate-500 mt-1">MinIO 对象存储桶，修改后新上传的对象将写入此桶</div>
          </el-form-item>

          <el-form-item label="预签名 URL 有效期（秒）" prop="urlTtlSeconds">
            <el-input-number
              v-model="form.urlTtlSeconds"
              :min="60"
              :max="604800"
              :step="3600"
              class="w-full"
            />
            <div class="text-xs text-slate-500 mt-1">预签名 URL 过期时间，最大 604800 秒（7 天）</div>
          </el-form-item>
        </div>

        <!-- 只读展示 -->
        <div class="readonly-section">
          <div class="section-label">以下配置由系统固定，不可修改</div>
          <div class="readonly-grid">
            <div class="readonly-item">
              <span class="label">存储提供商</span>
              <code class="readonly-value">{{ form.storageProvider || 'MINIO' }}</code>
            </div>
            <div class="readonly-item">
              <span class="label">哈希算法</span>
              <code class="readonly-value">{{ form.hashAlg || 'SM3' }}</code>
            </div>
          </div>
        </div>

        <el-form-item class="mt-6">
          <el-button type="primary" :loading="saving" @click="handleSave" size="large">
            <el-icon class="mr-1"><Check /></el-icon>
            保存配置
          </el-button>
          <el-button @click="fetchConfig" size="large">
            <el-icon class="mr-1"><Refresh /></el-icon>
            刷新
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

const activeConfig = ref<SidecarConfig | null>(null)

const form = reactive<SidecarConfig>({
  storageProvider: 'MINIO',
  bucket: 'sidecar',
  urlTtlSeconds: 604800,
  hashAlg: 'SM3',
  merkleParams: '',
  version: 0,
})

const rules: FormRules = {
  bucket: [{ required: true, message: '桶名称不能为空', trigger: 'blur' }],
  urlTtlSeconds: [{ required: true, message: '请设置 URL 有效期', trigger: 'change' }],
}

function formatTtl(seconds?: number): string {
  if (!seconds) return '未设置'
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)} 天 (${seconds}s)`
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)} 小时 (${seconds}s)`
  return `${seconds} 秒`
}

async function fetchConfig() {
  fetchLoading.value = true
  try {
    const data = await getSidecarConfig()
    activeConfig.value = data
    if (data) {
      form.bucket = data.bucket || 'sidecar'
      form.urlTtlSeconds = data.urlTtlSeconds || 604800
      form.storageProvider = data.storageProvider || 'MINIO'
      form.hashAlg = data.hashAlg || 'SM3'
    }
  } catch {
    activeConfig.value = null
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

onMounted(() => { fetchConfig() })
</script>

<style scoped>
.config-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.config-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-info-item .label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.info-value.highlight {
  color: #67e8f9;
  background: rgba(103, 232, 249, 0.08);
}

.readonly-section {
  margin-top: 16px;
  padding: 16px;
  background: rgba(100, 116, 139, 0.06);
  border-radius: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.readonly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.readonly-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.readonly-item .label {
  font-size: 11px;
  color: #64748b;
}

.readonly-value {
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}
</style>
