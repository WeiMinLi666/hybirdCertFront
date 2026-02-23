import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('@/layout/AppLayout.vue'),
        redirect: '/dashboard',
        children: [
            // ---- 概览大盘 ----
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '概览大盘', icon: 'Odometer' },
            },

            // ---- 证书申请工作台 ----
            {
                path: 'enrollment/legacy',
                name: 'LegacyCsr',
                component: () => import('@/views/enrollment/LegacyCsr.vue'),
                meta: { title: '标准国密申请', icon: 'Document', group: '证书申请工作台' },
            },
            {
                path: 'enrollment/hybrid-signature',
                name: 'HybridSignature',
                component: () => import('@/views/enrollment/HybridSignature.vue'),
                meta: { title: '混合签名证书', icon: 'EditPen', group: '证书申请工作台' },
            },
            {
                path: 'enrollment/hybrid-encryption',
                name: 'HybridEncryption',
                component: () => import('@/views/enrollment/HybridEncryption.vue'),
                meta: { title: '混合加密证书', icon: 'Lock', group: '证书申请工作台' },
            },

            // ---- 证书管理中心 ----
            {
                path: 'certificate/search',
                name: 'CertSearch',
                component: () => import('@/views/certificate/CertSearch.vue'),
                meta: { title: '证书检索', icon: 'Search', group: '证书管理中心' },
            },
            {
                path: 'certificate/chain-crl',
                name: 'CertChainCrl',
                component: () => import('@/views/certificate/CertChainCrl.vue'),
                meta: { title: '证书链与 CRL', icon: 'Link', group: '证书管理中心' },
            },
            {
                path: 'certificate/revoke',
                name: 'CertRevoke',
                component: () => import('@/views/certificate/CertRevoke.vue'),
                meta: { title: '证书吊销', icon: 'CircleClose', group: '证书管理中心' },
            },

            // ---- KMC & Sidecar 实验室 ----
            {
                path: 'devtools/kmc',
                name: 'KmcQuery',
                component: () => import('@/views/devtools/KmcQuery.vue'),
                meta: { title: 'KMC 密钥查询', icon: 'Key', group: 'DevTools' },
            },
            {
                path: 'devtools/sidecar',
                name: 'SidecarVerify',
                component: () => import('@/views/devtools/SidecarVerify.vue'),
                meta: { title: 'Sidecar 验证', icon: 'Shield', group: 'DevTools' },
            },

            // ---- 系统配置 ----
            {
                path: 'admin/pqc-policy',
                name: 'PqcPolicy',
                component: () => import('@/views/admin/PqcPolicy.vue'),
                meta: { title: 'PQC 策略配置', icon: 'Setting', group: '系统配置' },
            },
            {
                path: 'admin/sidecar-config',
                name: 'SidecarConfig',
                component: () => import('@/views/admin/SidecarConfig.vue'),
                meta: { title: 'Sidecar 配置', icon: 'Files', group: '系统配置' },
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
