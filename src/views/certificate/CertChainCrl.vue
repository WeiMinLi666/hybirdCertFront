<template>
  <div>
    <div class="page-header">
      <h2>证书链与 CRL</h2>
      <p>拉取当前 CA 证书链，下载最新 / 轻量级 CRL</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 证书链 -->
      <el-card>         
        <template #header>
          <span class="font-semibold">🔗 证书链</span>
        </template>
        <el-form-item label="证书序列号" class="mb-4">
          <div class="flex gap-2">
            <el-input v-model="chainSerial" placeholder="输入序列号以拉取证书链" />
            <el-button type="primary" :loading="chainLoading" @click="fetchChain">
              <el-icon class="mr-1"><Link /></el-icon>
              拉取
            </el-button>
          </div>
        </el-form-item>

        <div v-if="chainData" class="space-y-3">
          <div
            v-for="(cert, idx) in chainData.chain"
            :key="idx"
            class="chain-cert"
          >
            <div class="chain-cert__header">
              <el-tag size="small" :type="idx === 0 ? 'primary' : idx === chainData.chain.length - 1 ? 'success' : 'info'" effect="dark">
                {{ idx === 0 ? '终端证书' : idx === chainData.chain.length - 1 ? '根证书' : `中间 CA ${idx}` }}
              </el-tag>
              <el-button size="small" text @click="copyCert(cert)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
            <pre class="pem-block-sm">{{ cert }}</pre>
          </div>
        </div>
      </el-card>

      <!-- CRL -->
      <el-card>
        <template #header>
          <span class="font-semibold">📜 证书吊销列表 (CRL)</span>
        </template>
        <el-form-item label="CA ID (可选)" class="mb-4">
          <div class="flex gap-2">
            <el-input v-model="caId" placeholder="默认获取主 CA 的 CRL" />
            <el-button type="primary" :loading="crlLoading" @click="fetchCrl">
              <el-icon class="mr-1"><Download /></el-icon>
              获取 CRL
            </el-button>
          </div>
        </el-form-item>

        <div v-if="crlData">
          <el-descriptions v-if="crlData.crlUrl" :column="1" border class="mb-4">
            <el-descriptions-item label="Sidecar 大对象 URL">
              <div class="flex items-center gap-2">
                <code class="text-xs text-cyan-400 break-all">{{ crlData.crlUrl }}</code>
                <el-button size="small" text @click="copyText(crlData.crlUrl)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
          <el-alert
            v-else
            title="当前无 Sidecar 发布 URL（尚未有证书被吊销，CRL 为实时生成的空列表）"
            type="info"
            :closable="false"
            show-icon
            class="mb-4"
          />

          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-400 font-medium">CRL PEM</span>
            <el-button size="small" text @click="downloadCrl">
              <el-icon class="mr-1"><Download /></el-icon>
              下载 CRL 文件
            </el-button>
          </div>
          <pre class="pem-block-sm">{{ crlData.crlPem }}</pre>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Link, Download, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCertChain, getCrl } from '@/api/ca'
import type { CertChainInfo, CrlInfo } from '@/types'

const chainSerial = ref('')
const chainLoading = ref(false)
const chainData = ref<CertChainInfo | null>(null)

const caId = ref('')
const crlLoading = ref(false)
const crlData = ref<CrlInfo | null>(null)

async function fetchChain() {
  if (!chainSerial.value.trim()) {
    ElMessage.warning('请输入序列号')
    return
  }
  chainLoading.value = true
  try {
    chainData.value = await getCertChain(chainSerial.value.trim())
  } catch {
    chainData.value = null
  } finally {
    chainLoading.value = false
  }
}

async function fetchCrl() {
  crlLoading.value = true
  try {
    crlData.value = await getCrl(caId.value || undefined)
  } catch {
    crlData.value = null
  } finally {
    crlLoading.value = false
  }
}

function copyCert(pem: string) {
  navigator.clipboard.writeText(pem)
  ElMessage.success('已复制')
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

function downloadCrl() {
  if (!crlData.value?.crlPem) return
  const blob = new Blob([crlData.value.crlPem], { type: 'application/x-pem-file' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'crl.pem'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.chain-cert {
  background: #0f172a;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 16px;
}

.chain-cert__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pem-block-sm {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.5;
  color: #10b981;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
