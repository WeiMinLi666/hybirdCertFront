<template>
  <div>
    <div class="page-header">
      <h2>证书检索</h2>
      <p>输入证书序列号，查看证书详细信息与 PEM 原文</p>
    </div>

    <!-- 搜索栏 -->
    <el-card>
      <div class="flex gap-4 items-end">
        <el-form-item label="证书序列号 (Serial)" class="flex-1 mb-0">
          <el-input
            v-model="serial"
            placeholder="输入证书序列号，如 7A3B..."
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSearch" size="large">
          <el-icon class="mr-1"><Search /></el-icon>
          检索
        </el-button>
        <el-button
          v-if="certInfo"
          @click="handleDownload"
          size="large"
          type="success"
          plain
        >
          <el-icon class="mr-1"><Download /></el-icon>
          下载 PEM
        </el-button>
      </div>
    </el-card>

    <!-- 证书详情 -->
    <transition name="fade-slide">
      <div v-if="certInfo" class="mt-6 space-y-6">
        <el-card>
          <template #header>
            <span class="font-semibold">📋 证书基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="序列号" :span="2">
              <code class="text-cyan-400">{{ certInfo.serial }}</code>
            </el-descriptions-item>
            <el-descriptions-item label="主题 DN" :span="2">
              {{ certInfo.subjectDn }}
            </el-descriptions-item>
            <el-descriptions-item label="签发者 DN" :span="2">
              {{ certInfo.issuerDn }}
            </el-descriptions-item>
            <el-descriptions-item label="生效时间">{{ certInfo.notBefore }}</el-descriptions-item>
            <el-descriptions-item label="截止时间">{{ certInfo.notAfter }}</el-descriptions-item>
            <el-descriptions-item label="签名算法">{{ certInfo.algorithm }}</el-descriptions-item>
            <el-descriptions-item label="PQC 算法">
              <el-tag v-if="certInfo.pqcAlg" effect="dark">{{ certInfo.pqcAlg }}</el-tag>
              <span v-else class="text-slate-500">—</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="certInfo.status === 'VALID' ? 'success' : certInfo.status === 'REVOKED' ? 'danger' : 'warning'"
                effect="dark"
              >
                {{ certInfo.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="指纹">
              <code class="text-xs text-slate-400">{{ certInfo.fingerprint || '—' }}</code>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">📄 PEM 原文</span>
              <el-button size="small" text @click="copyPem">
                <el-icon class="mr-1"><CopyDocument /></el-icon>
                复制
              </el-button>
            </div>
          </template>
          <pre class="pem-block">{{ certInfo.pem }}</pre>
        </el-card>
      </div>
    </transition>

    <!-- 空状态 -->
    <div v-if="searched && !certInfo && !loading" class="empty-state mt-10">
      <el-icon :size="48" color="#64748b"><Warning /></el-icon>
      <p class="mt-4 text-slate-400">未找到序列号为 <code>{{ serial }}</code> 的证书</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Download, CopyDocument, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCertificate } from '@/api/ca'
import type { CertificateInfo } from '@/types'

const serial = ref('')
const loading = ref(false)
const searched = ref(false)
const certInfo = ref<CertificateInfo | null>(null)

async function handleSearch() {
  if (!serial.value.trim()) {
    ElMessage.warning('请输入证书序列号')
    return
  }

  loading.value = true
  searched.value = true
  try {
    certInfo.value = await getCertificate(serial.value.trim())
  } catch {
    certInfo.value = null
  } finally {
    loading.value = false
  }
}

function copyPem() {
  if (certInfo.value?.pem) {
    navigator.clipboard.writeText(certInfo.value.pem)
    ElMessage.success('已复制到剪贴板')
  }
}

function handleDownload() {
  if (!certInfo.value?.pem) return
  const blob = new Blob([certInfo.value.pem], { type: 'application/x-pem-file' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cert_${certInfo.value.serial}.pem`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已开始下载')
}
</script>

<style scoped>
.pem-block {
  background: #0f172a;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #10b981;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 40px;
}
</style>
