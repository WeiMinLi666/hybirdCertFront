<template>
  <div>
    <div class="page-header">
      <h2>KMC 密钥查询</h2>
      <p>输入 Key ID 检索 KMC 托管密钥状态，支持禁用操作</p>
    </div>

    <!-- 搜索栏 -->
    <el-card>
      <div class="flex gap-4 items-end">
        <el-form-item label="Key ID" class="flex-1 mb-0">
          <el-input
            v-model="keyId"
            placeholder="输入 Key ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch" size="large">
          <el-icon class="mr-1"><Search /></el-icon>
          查询
        </el-button>
      </div>
    </el-card>

    <!-- 密钥详情 -->
    <transition name="fade-slide">
      <el-card v-if="keyInfo" class="mt-6">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">🔑 密钥详情</span>
            <el-popconfirm
              v-if="keyInfo.status !== 'DISABLED'"
              title="确认禁用此密钥？"
              confirm-button-text="确认"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDisable"
            >
              <template #reference>
                <el-button type="danger" size="small" :loading="disabling">
                  <el-icon class="mr-1"><Lock /></el-icon>
                  禁用密钥
                </el-button>
              </template>
            </el-popconfirm>
            <el-tag v-else type="info" effect="dark">已禁用</el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="Key ID">
            <code class="text-cyan-400">{{ keyInfo.keyId }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="PQC 算法">
            <el-tag effect="plain" type="info">{{ keyInfo.pqcAlg || '—' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="keyInfo.status === 'ACTIVE' ? 'success' : keyInfo.status === 'DISABLED' ? 'danger' : 'warning'"
              effect="dark"
            >
              {{ keyInfo.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用途">{{ keyInfo.usage }}</el-descriptions-item>
          <el-descriptions-item label="所属主体 ID">
            <code class="text-cyan-400 text-xs">{{ keyInfo.ownerPrincipalId || '—' }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="SM2 公钥">
            <div v-if="keyInfo.sm2PublicKey" class="flex items-center gap-2">
              <code class="text-emerald-400 text-xs truncate max-w-xs">{{ keyInfo.sm2PublicKey.substring(0, 32) }}...</code>
              <el-button size="small" text @click="copyText(keyInfo.sm2PublicKey)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
            <span v-else class="text-slate-500">—</span>
          </el-descriptions-item>
          <el-descriptions-item label="PQC 公钥" :span="2">
            <div v-if="keyInfo.pqcPublicKey" class="flex items-center gap-2">
              <code class="text-emerald-400 text-xs truncate max-w-md">{{ keyInfo.pqcPublicKey.substring(0, 48) }}...</code>
              <el-button size="small" text @click="copyText(keyInfo.pqcPublicKey)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
            <span v-else class="text-slate-500">—</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Lock, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getKmcKey, disableKmcKey } from '@/api/kmc'
import type { KmcKeyInfo } from '@/types'

const keyId = ref('')
const loading = ref(false)
const disabling = ref(false)
const keyInfo = ref<KmcKeyInfo | null>(null)

async function handleSearch() {
  if (!keyId.value.trim()) {
    ElMessage.warning('请输入 Key ID')
    return
  }
  loading.value = true
  try {
    keyInfo.value = await getKmcKey(keyId.value.trim())
  } catch {
    keyInfo.value = null
  } finally {
    loading.value = false
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

async function handleDisable() {
  if (!keyInfo.value) return
  disabling.value = true
  try {
    await disableKmcKey(keyInfo.value.keyId)
    keyInfo.value.status = 'DISABLED'
    ElMessage.success('密钥已禁用')
  } catch {
    // handled
  } finally {
    disabling.value = false
  }
}
</script>
