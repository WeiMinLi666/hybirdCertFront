<template>
  <div>
    <div class="page-header">
      <h2>PQC 策略管理</h2>
      <p>查看当前生效策略，或新增策略版本来调整算法配置（新策略保存后立即生效）</p>
    </div>

    <!-- 当前生效策略 -->
    <el-card v-loading="fetchLoading" class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">当前生效策略</span>
          <el-tag v-if="activePolicy" :type="activePolicy.enabled ? 'success' : 'danger'" effect="dark" size="small">
            {{ activePolicy.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </div>
      </template>

      <div v-if="activePolicy" class="policy-info-grid">
        <div class="policy-info-item">
          <span class="label">策略名称</span>
          <span class="value">{{ activePolicy.name }}</span>
        </div>
        <div class="policy-info-item">
          <span class="label">版本</span>
          <span class="value">v{{ activePolicy.version }}</span>
        </div>
        <div class="policy-info-item">
          <span class="label">默认签名算法</span>
          <code class="alg-value">{{ activePolicy.defaultSignAlg || '未设置' }}</code>
        </div>
        <div class="policy-info-item">
          <span class="label">默认加密算法</span>
          <code class="alg-value">{{ activePolicy.defaultEncAlg || '未设置' }}</code>
        </div>
        <div class="policy-info-item">
          <span class="label">最低安全等级</span>
          <code class="alg-value level">{{ activePolicy.securityLevel }}</code>
        </div>
        <div class="policy-info-item">
          <span class="label">生效时间</span>
          <span class="value text-slate-400 text-xs">{{ activePolicy.effectiveFrom ?? '立即生效' }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无生效策略，请在下方创建第一条策略" :image-size="60" />
    </el-card>

    <!-- 新建/更新策略 -->
    <el-card>
      <template #header>
        <span class="font-semibold">新建策略版本</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSave"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="策略名称" prop="name">
            <el-input v-model="form.name" placeholder="例：生产策略 v2" />
          </el-form-item>

          <el-form-item label="策略版本号" prop="version">
            <el-input-number v-model="form.version" :min="1" class="w-full" />
          </el-form-item>
        </div>

        <div class="section-label">算法配置</div>
        <p class="section-desc">签发时若客户端未指定算法，自动使用下方策略默认值</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="默认签名算法（混合证书）" prop="defaultSignAlg">
            <el-select v-model="form.defaultSignAlg" placeholder="选择 PQC 签名算法" class="w-full">
              <el-option-group label="ML-DSA (Dilithium) — NIST FIPS 204">
                <el-option label="ML-DSA-44  (Level 2)" value="ML-DSA-44" />
                <el-option label="ML-DSA-65  (Level 3)" value="ML-DSA-65" />
                <el-option label="ML-DSA-87  (Level 5)" value="ML-DSA-87" />
              </el-option-group>
              <el-option-group label="FALCON — NIST PQC Round 3">
                <el-option label="FALCON-512  (Level 1)" value="FALCON-512" />
                <el-option label="FALCON-1024 (Level 5)" value="FALCON-1024" />
              </el-option-group>
              <el-option-group label="SLH-DSA (SPHINCS+) — NIST FIPS 205">
                <el-option label="SLH-DSA-128 (Level 1)" value="SLH-DSA-128" />
                <el-option label="SLH-DSA-192 (Level 3)" value="SLH-DSA-192" />
                <el-option label="SLH-DSA-256 (Level 5)" value="SLH-DSA-256" />
              </el-option-group>
            </el-select>
            <div class="text-xs text-slate-500 mt-1">用于混合签名证书（Hybrid）中的 PQC 签名验证</div>
          </el-form-item>

          <el-form-item label="默认加密算法（加密证书）" prop="defaultEncAlg">
            <el-select v-model="form.defaultEncAlg" placeholder="选择 PQC 加密算法" class="w-full">
              <el-option-group label="ML-KEM (Kyber) — NIST FIPS 203">
                <el-option label="ML-KEM-512  (Level 1)" value="ML-KEM-512" />
                <el-option label="ML-KEM-768  (Level 3)" value="ML-KEM-768" />
                <el-option label="ML-KEM-1024 (Level 5)" value="ML-KEM-1024" />
              </el-option-group>
            </el-select>
            <div class="text-xs text-slate-500 mt-1">用于混合加密证书（Encryption）中的 PQC 密钥封装</div>
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
          <el-form-item label="最低安全等级（所有 PQC 算法的拒绝下限）" prop="securityLevel">
            <el-select v-model="form.securityLevel" class="w-full">
              <el-option label="Level 1 (AES-128 等效)" value="LEVEL_1" />
              <el-option label="Level 3 (AES-192 等效)" value="LEVEL_3" />
              <el-option label="Level 5 (AES-256 等效)" value="LEVEL_5" />
            </el-select>
            <div class="text-xs text-slate-500 mt-1">低于此等级的 PQC 算法请求将被服务端拒绝</div>
          </el-form-item>

          <el-form-item label="是否立即启用" prop="enabled">
            <el-switch
              v-model="form.enabled"
              active-text="保存后立即生效"
              inactive-text="暂不启用"
              inline-prompt
              size="large"
            />
          </el-form-item>
        </div>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave" size="large">
            <el-icon class="mr-1"><Check /></el-icon>
            保存新策略
          </el-button>
          <el-button @click="fetchPolicy" size="large">
            <el-icon class="mr-1"><Refresh /></el-icon>
            刷新生效策略
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

// 当前生效策略（只读展示）
const activePolicy = ref<PqcPolicy | null>(null)

// 新建策略表单
const form = reactive<PqcPolicy>({
  name: '',
  enabled: true,
  pqcAlg: '',
  defaultSignAlg: 'ML-DSA-65',
  defaultEncAlg: 'ML-KEM-768',
  securityLevel: 'LEVEL_3',
  version: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '必填', trigger: 'blur' }],
  defaultSignAlg: [{ required: true, message: '请选择默认签名算法', trigger: 'change' }],
  defaultEncAlg: [{ required: true, message: '请选择默认加密算法', trigger: 'change' }],
  securityLevel: [{ required: true, message: '请选择安全等级', trigger: 'change' }],
}

async function fetchPolicy() {
  fetchLoading.value = true
  try {
    const data = await getPqcPolicy()
    activePolicy.value = data
    // 用当前生效策略的算法作为新建表单的初始值参考
    if (data) {
      form.defaultSignAlg = data.defaultSignAlg || 'ML-DSA-65'
      form.defaultEncAlg = data.defaultEncAlg || 'ML-KEM-768'
      form.securityLevel = data.securityLevel || 'LEVEL_3'
      form.version = (data.version ?? 0) + 1
    }
  } catch {
    activePolicy.value = null
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
    ElMessage.success('策略已保存')
    await fetchPolicy()
  } catch {
    // handled by global interceptor
  } finally {
    saving.value = false
  }
}

onMounted(() => { fetchPolicy() })
</script>

<style scoped>
.policy-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.policy-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.policy-info-item .label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.policy-info-item .value {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 500;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 8px 0 2px;
}

.section-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 16px;
}

.alg-value {
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #67e8f9;
  background: rgba(103, 232, 249, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.alg-value.level {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.08);
}
</style>
