<template>
  <div class="app-layout">
    <!-- ====== 侧边栏 ====== -->
    <aside
      class="sidebar"
      :class="{ 'sidebar--collapsed': appStore.sidebarCollapsed }"
    >
      <!-- Logo -->
      <div class="sidebar__logo">
        <el-icon :size="28" color="#818cf8"><Key /></el-icon>
        <transition name="fade">
          <span v-show="!appStore.sidebarCollapsed" class="sidebar__logo-text">
            混合证书系统
          </span>
        </transition>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="currentPath"
        :collapse="appStore.sidebarCollapsed"
        router
        class="sidebar__menu"
      >
        <!-- 概览 -->
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>概览大盘</template>
        </el-menu-item>

        <!-- 证书申请工作台 -->
        <el-sub-menu index="enrollment">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>证书申请工作台</span>
          </template>
          <el-menu-item index="/enrollment/legacy">
            <el-icon><DocumentAdd /></el-icon>
            标准国密申请
          </el-menu-item>
          <el-menu-item index="/enrollment/hybrid-signature">
            <el-icon><EditPen /></el-icon>
            混合签名证书
          </el-menu-item>
          <el-menu-item index="/enrollment/hybrid-encryption">
            <el-icon><Lock /></el-icon>
            混合加密证书
          </el-menu-item>
        </el-sub-menu>

        <!-- 证书管理中心 -->
        <el-sub-menu index="certificate">
          <template #title>
            <el-icon><FolderOpened /></el-icon>
            <span>证书管理中心</span>
          </template>
          <el-menu-item index="/certificate/search">
            <el-icon><Search /></el-icon>
            证书检索
          </el-menu-item>
          <el-menu-item index="/certificate/chain-crl">
            <el-icon><Connection /></el-icon>
            证书链与 CRL
          </el-menu-item>
          <el-menu-item index="/certificate/revoke">
            <el-icon><CircleClose /></el-icon>
            证书吊销
          </el-menu-item>
        </el-sub-menu>

        <!-- DevTools -->
        <el-sub-menu index="devtools">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>DevTools</span>
          </template>
          <el-menu-item index="/devtools/kmc">
            <el-icon><Key /></el-icon>
            KMC 密钥查询
          </el-menu-item>
          <el-menu-item index="/devtools/kmc-distribution">
            <el-icon><Promotion /></el-icon>
            KMC 密钥分发
          </el-menu-item>
          <el-menu-item index="/devtools/sidecar">
            <el-icon><CircleCheck /></el-icon>
            Sidecar 验证
          </el-menu-item>
        </el-sub-menu>

        <!-- 系统配置 -->
        <el-sub-menu index="admin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统配置</span>
          </template>
          <el-menu-item index="/admin/pqc-policy">
            <el-icon><Cpu /></el-icon>
            PQC 策略配置
          </el-menu-item>
          <el-menu-item index="/admin/sidecar-config">
            <el-icon><Files /></el-icon>
            Sidecar 配置
          </el-menu-item>
          <el-menu-item index="/admin/audit-log">
            <el-icon><Document /></el-icon>
            审计日志
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- ====== 主内容区 ====== -->
    <div class="main-area">
      <!-- 顶栏 -->
      <header class="topbar">
        <div class="topbar__left">
          <el-button
            text
            @click="appStore.toggleSidebar()"
            class="topbar__toggle"
          >
            <el-icon :size="20">
              <Fold v-if="!appStore.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <el-breadcrumb separator="/" class="topbar__breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute?.meta?.group">
              {{ currentRoute.meta.group }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute?.meta?.title || '概览' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar__right">
          <el-tag type="success" effect="dark" round>
            <el-icon class="mr-1"><CircleCheck /></el-icon>
            GB/T 35114
          </el-tag>
          <el-tag effect="dark" round style="margin-left: 8px">
            PQC Ready
          </el-tag>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const currentPath = computed(() => route.path)
const currentRoute = computed(() => route)
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ---- Sidebar ---- */
.sidebar {
  width: 260px;
  min-width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar--collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar__logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  background: linear-gradient(135deg, #818cf8, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar__menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* ---- Main Area ---- */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-color);
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar__toggle {
  color: var(--text-secondary) !important;
}

.topbar__breadcrumb {
  --el-breadcrumb-text-color: var(--text-muted);
  --el-breadcrumb-inner-text-color: var(--text-secondary);
}

.topbar__right {
  display: flex;
  align-items: center;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ---- Fade helper ---- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
