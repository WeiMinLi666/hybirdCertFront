import request from '@/utils/request'
import type { KmcKeyInfo } from '@/types'

/** 查询 KMC 密钥信息 */
export function getKmcKey(keyId: string) {
    return request.get<KmcKeyInfo>(`/kmc/keys/${keyId}`)
}

/** 禁用 KMC 密钥 */
export function disableKmcKey(keyId: string) {
    return request.put<void>(`/kmc/keys/${keyId}/disable`)
}

/** 查询密钥分发记录 */
export function getKmcDistribution(distributionId: string) {
    return request.get<{ distributionId: string; packageUrl: string; status: string }>(`/kmc/distributions/${distributionId}`)
}

/** 创建密钥分发 */
export function createKmcDistribution(data: { keyId: string; targetPrincipalId?: string }) {
    return request.post<{ distributionId: string; packageUrl: string; status: string }>('/kmc/distributions', data)
}
