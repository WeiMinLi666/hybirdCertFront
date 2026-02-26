<template>
  <div>
    <div class="page-header">
      <h2>KMC 密钥分发</h2>
      <p>查询密钥分发记录，获取密钥信封下载地址</p>
    </div>

    <!-- 查询分发记录 -->
    <el-card>
      <template #header>
        <span class="font-semibold">📦 查询分发记录</span>
      </template>
      <div class="flex gap-4 items-end">
        <el-form-item label="Distribution ID" class="flex-1 mb-0">
          <el-input
            v-model="distributionId"
            placeholder="输入密钥分发单 ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-button type="primary" :loading="queryLoading" @click="handleQuery" size="large">
          <el-icon class="mr-1"><Search /></el-icon>
          查询
        </el-button>
      </div>
    </el-card>

    <!-- 查询结果 -->
    <transition name="fade-slide">
      <el-card v-if="queryResult" class="mt-6">
        <template #header>
          <span class="font-semibold">🔍 分发详情</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Distribution ID">
            <code class="text-cyan-400">{{ queryResult.distributionId }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="queryResult.status === 'DISTRIBUTED' ? 'success' : 'warning'"
              effect="dark"
            >
              {{ queryResult.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="密钥信封 URL">
            <div v-if="queryResult.packageUrl" class="flex items-center gap-2">
              <code class="text-emerald-400 text-xs break-all">{{ queryResult.packageUrl }}</code>
              <el-button size="small" text @click="copyUrl(queryResult.packageUrl)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
            <span v-else class="text-slate-500">—</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </transition>

    <!-- 手动创建分发 -->
    <el-card class="mt-6">
      <template #header>
        <span class="font-semibold">➕ 手动创建密钥分发</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleCreate"
      >
        <el-form-item label="Key ID" prop="keyId">
          <el-input v-model="form.keyId" placeholder="KMC 密钥 ID" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="createLoading" @click="handleCreate" size="large">
            <el-icon class="mr-1"><Promotion /></el-icon>
            创建分发
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 创建结果 -->
    <transition name="fade-slide">
      <el-card v-if="createResult" class="mt-6">
        <template #header>
          <span class="font-semibold">✅ 分发创建成功</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Distribution ID">
            <el-tag effect="dark">{{ createResult.distributionId }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="success" effect="dark">{{ createResult.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="密钥信封 URL">
            <div v-if="createResult.packageUrl" class="kmc-url-box">
              <span class="kmc-url-label">Package URL</span>
              <div class="kmc-url-value">
                <code>{{ createResult.packageUrl }}</code>
                <el-button size="small" text @click="copyUrl(createResult.packageUrl)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
            <span v-else class="text-slate-500">—</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </transition>

    <!-- 空状态 -->
    <div v-if="querySearched && !queryResult && !queryLoading" class="empty-state mt-10">
      <el-icon :size="48" color="#64748b"><Warning /></el-icon>
      <p class="mt-4 text-slate-400">未找到 ID 为 <code>{{ distributionId }}</code> 的分发记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, CopyDocument, Promotion, Warning } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getKmcDistribution, createKmcDistribution } from '@/api/kmc'

interface DistributionResult {
  distributionId: string
  packageUrl: string
  status: string
}

const formRef = ref<FormInstance>()

// --- Query ---
const distributionId = ref('')
const queryLoading = ref(false)
const querySearched = ref(false)
const queryResult = ref<DistributionResult | null>(null)

async function handleQuery() {
  if (!distributionId.value.trim()) {
    ElMessage.warning('请输入 Distribution ID')
    return
  }
  queryLoading.value = true
  querySearched.value = true
  try {
    queryResult.value = await getKmcDistribution(distributionId.value.trim())
  } catch {
    queryResult.value = null
  } finally {
    queryLoading.value = false
  }
}

// --- Create ---
const createLoading = ref(false)
const createResult = ref<DistributionResult | null>(null)
const form = reactive({
  keyId: '',
})

const rules: FormRules = {
  keyId: [{ required: true, message: '请输入 Key ID', trigger: 'blur' }],
}

async function handleCreate() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  createLoading.value = true
  try {
    createResult.value = await createKmcDistribution(form)
    ElMessage.success('密钥分发创建成功！')
  } catch {
    // handled by interceptor
  } finally {
    createLoading.value = false
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  ElMessage.success('已复制 URL 到剪贴板')
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px;
}

.kmc-url-box {
  background: #0f172a;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 4px;
}

.kmc-url-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.kmc-url-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.kmc-url-value code {
  font-family: 'JetBrains Mono', monospace;
  color: #06b6d4;
  font-size: 13px;
  word-break: break-all;
}
</style>
