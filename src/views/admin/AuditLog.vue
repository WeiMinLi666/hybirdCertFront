<template>
  <div>
    <div class="page-header">
      <h2>审计日志</h2>
      <p>查看系统操作审计记录，支持按事件类型筛选</p>
    </div>

    <!-- 筛选栏 -->
    <el-card class="mb-4">
      <div class="flex items-center gap-4 flex-wrap">
        <el-select v-model="filterType" placeholder="全部事件类型" clearable class="w-48" @change="fetchLogs">
          <el-option v-for="t in eventTypes" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button type="primary" @click="fetchLogs" :loading="loading">
          <el-icon class="mr-1"><Search /></el-icon>
          查询
        </el-button>
        <span class="count-badge ml-auto">共 {{ logs.length }} 条</span>
      </div>
    </el-card>

    <!-- 日志表格 -->
    <el-card v-loading="loading">
      <el-table :data="logs" style="width: 100%" max-height="600" empty-text="暂无审计记录">
        <el-table-column prop="eventTime" label="时间" width="180" sortable>
          <template #default="{ row }">
            <span class="cell-time">{{ formatTime(row.eventTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="eventType" label="事件类型" width="220">
          <template #default="{ row }">
            <span :class="['event-badge', getEventClass(row.eventType)]">{{ row.eventType }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="objectType" label="对象类型" width="140">
          <template #default="{ row }">
            <span class="cell-secondary">{{ row.objectType }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="objectId" label="对象 ID" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <code class="cell-id">{{ row.objectId }}</code>
          </template>
        </el-table-column>

        <el-table-column prop="result" label="结果" width="90" align="center">
          <template #default="{ row }">
            <span :class="['result-dot', row.result === 'SUCCESS' ? 'success' : 'fail']">
              {{ row.result === 'SUCCESS' ? '成功' : '失败' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="描述" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-secondary">{{ row.message || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="traceId" label="Trace ID" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <code class="cell-trace">{{ row.traceId || '-' }}</code>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { listAuditLogs } from '@/api/admin'
import type { AuditEvent } from '@/types'

const loading = ref(false)
const filterType = ref('')
const logs = ref<AuditEvent[]>([])

const eventTypes = [
  { label: '证书签发', value: 'CERTIFICATE_ISSUED' },
  { label: '证书吊销', value: 'CERTIFICATE_REVOKED' },
  { label: 'KMC 密钥生成', value: 'KMC_KEY_GENERATED' },
  { label: 'KMC 分发创建', value: 'KMC_DISTRIBUTION_CREATED' },
  { label: 'Sidecar 对象失效', value: 'SIDECAR_OBJECT_INVALIDATED' },
]

function formatTime(iso: string): string {
  if (!iso) return '-'
  return iso.replace('T', ' ').substring(0, 19)
}

function getEventClass(eventType: string): string {
  if (eventType?.includes('ISSUED') || eventType?.includes('GENERATED')) return 'event-success'
  if (eventType?.includes('REVOKED') || eventType?.includes('INVALIDATED')) return 'event-danger'
  if (eventType?.includes('DISTRIBUTION')) return 'event-warning'
  return 'event-info'
}

async function fetchLogs() {
  loading.value = true
  try {
    const data = await listAuditLogs(filterType.value || undefined)
    logs.value = data ?? []
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchLogs() })
</script>

<style scoped>
/* 统计数字 */
.count-badge {
  font-size: 12px;
  color: #94a3b8;
}

/* 时间列 */
.cell-time {
  font-size: 12px;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
}

/* 灰色辅助文字 */
.cell-secondary {
  font-size: 12px;
  color: #94a3b8;
}

/* 对象 ID：等宽，低饱和度青色 */
.cell-id {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
  color: #7dd3fc;
  background: rgba(125, 211, 252, 0.06);
  padding: 1px 6px;
  border-radius: 3px;
}

/* Trace ID：琥珀色调 */
.cell-trace {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
  color: #fcd34d;
  opacity: 0.7;
}

/* 事件类型徽章 */
.event-badge {
  display: inline-block;
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.event-success {
  color: #86efac;
  background: rgba(134, 239, 172, 0.08);
}

.event-danger {
  color: #fca5a5;
  background: rgba(252, 165, 165, 0.08);
}

.event-warning {
  color: #fcd34d;
  background: rgba(252, 211, 77, 0.08);
}

.event-info {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.06);
}

/* 结果指示器 */
.result-dot {
  font-size: 12px;
  font-weight: 500;
}

.result-dot::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.result-dot.success {
  color: #86efac;
}

.result-dot.success::before {
  background: #4ade80;
}

.result-dot.fail {
  color: #fca5a5;
}

.result-dot.fail::before {
  background: #f87171;
}
</style>
