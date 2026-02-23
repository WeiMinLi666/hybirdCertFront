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
