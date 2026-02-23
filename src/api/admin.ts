import request from '@/utils/request'
import type { PqcPolicy, SidecarConfig } from '@/types'

/** 获取 PQC 策略配置 */
export function getPqcPolicy() {
    return request.get<PqcPolicy>('/admin/pqc-policy')
}

/** 更新 PQC 策略配置 */
export function updatePqcPolicy(data: PqcPolicy) {
    return request.put<void>('/admin/pqc-policy', data)
}

/** 获取 Sidecar 配置 */
export function getSidecarConfig() {
    return request.get<SidecarConfig>('/admin/sidecar-config')
}

/** 更新 Sidecar 配置 */
export function updateSidecarConfig(data: SidecarConfig) {
    return request.put<void>('/admin/sidecar-config', data)
}
