<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h2>系统概览大盘</h2>
      <p>GB/T 35114 抗量子混合证书管理系统 — 实时状态一览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="stat in statsCards"
        :key="stat.title"
        class="stat-card"
        :style="{ '--accent': stat.color }"
      >
        <div class="stat-card__icon">
          <el-icon :size="28"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ stat.value }}</span>
          <span class="stat-card__title">{{ stat.title }}</span>
        </div>
        <div class="stat-card__glow" />
      </div>
    </div>

    <!-- 快捷操作 -->
    <el-card class="mt-6">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon :size="18" color="#818cf8"><Lightning /></el-icon>
          <span class="font-semibold">快捷操作</span>
        </div>
      </template>
      <div class="quick-actions">
        <router-link
          v-for="action in quickActions"
          :key="action.path"
          :to="action.path"
          class="quick-action-item"
        >
          <el-icon :size="24" :color="action.color">
            <component :is="action.icon" />
          </el-icon>
          <span class="quick-action-item__label">{{ action.label }}</span>
          <span class="quick-action-item__desc">{{ action.desc }}</span>
        </router-link>
      </div>
    </el-card>

    <!-- 系统信息 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <el-card>
        <template #header>
          <span class="font-semibold">🔐 密码学引擎状态</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="国密算法">SM2 / SM3 / SM4</el-descriptions-item>
          <el-descriptions-item label="PQC 签名算法">ML-DSA-65 (Dilithium3)</el-descriptions-item>
          <el-descriptions-item label="PQC 加密算法">ML-KEM-768 (Kyber768)</el-descriptions-item>
          <el-descriptions-item label="混合模式">
            <el-tag type="success" effect="dark">已启用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="安全等级">
            <el-tag effect="dark">CNSA 2.0 Level 3</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card>
        <template #header>
          <span class="font-semibold">🏗️ 微服务健康状态</span>
        </template>
        <div class="service-list">
          <div v-for="svc in services" :key="svc.name" class="service-item">
            <div class="flex items-center gap-3">
              <span
                class="service-dot"
                :class="svc.status === 'UP' ? 'service-dot--up' : 'service-dot--down'"
              />
              <span class="font-medium">{{ svc.name }}</span>
            </div>
            <el-tag
              :type="svc.status === 'UP' ? 'success' : 'danger'"
              size="small"
              effect="dark"
              round
            >
              {{ svc.status }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const statsCards = reactive([
  { title: '已签发证书', value: '1,284', icon: 'Ticket', color: '#6366f1' },
  { title: '混合证书', value: '856', icon: 'Connection', color: '#06b6d4' },
  { title: 'KMC 托管密钥', value: '2,047', icon: 'Key', color: '#10b981' },
  { title: '已吊销证书', value: '23', icon: 'CircleClose', color: '#ef4444' },
])

const quickActions = reactive([
  { label: '国密 CSR 申请', desc: '提交标准 SM2 证书签发请求', path: '/enrollment/legacy', icon: 'DocumentAdd', color: '#818cf8' },
  { label: '混合签名证书', desc: 'SM2 + PQC 双签名证书申请', path: '/enrollment/hybrid-signature', icon: 'EditPen', color: '#06b6d4' },
  { label: '混合加密证书', desc: 'PQC 加密证书一键签发', path: '/enrollment/hybrid-encryption', icon: 'Lock', color: '#10b981' },
  { label: '证书检索', desc: '按序列号查询证书详情', path: '/certificate/search', icon: 'Search', color: '#f59e0b' },
  { label: 'PQC 策略管理', desc: '配置后量子密码学策略', path: '/admin/pqc-policy', icon: 'Cpu', color: '#a855f7' },
  { label: '证书吊销', desc: '快速吊销失效证书', path: '/certificate/revoke', icon: 'CircleClose', color: '#ef4444' },
])

const services = reactive([
  { name: 'Enrollment Service', status: 'UP' },
  { name: 'CA Service', status: 'UP' },
  { name: 'KMC Service', status: 'UP' },
  { name: 'Sidecar Service', status: 'UP' },
  { name: 'Admin Service', status: 'UP' },
])
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
  flex-shrink: 0;
}

.stat-card__info {
  display: flex;
  flex-direction: column;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-card__title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.stat-card__glow {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.06;
  filter: blur(40px);
  pointer-events: none;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
  text-align: center;
}

.quick-action-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.quick-action-item__label {
  font-weight: 600;
  margin-top: 10px;
  font-size: 14px;
}

.quick-action-item__desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
}

.service-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.service-dot--up {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

.service-dot--down {
  background: var(--color-danger);
  box-shadow: 0 0 8px var(--color-danger);
}
</style>
