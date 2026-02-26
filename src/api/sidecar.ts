import request from '@/utils/request'
import type { SidecarObjectInfo, SidecarVerifyResult } from '@/types'

/** 查询 Sidecar 对象 */
export function getSidecarObject(objectId: string) {
    return request.get<SidecarObjectInfo>(`/sidecar/objects/${objectId}`)
}

/** 验证 Sidecar 对象防篡改 */
export function verifySidecarObject(objectId: string, rootHash: string) {
    return request.post<SidecarVerifyResult>(
        '/sidecar/verify',
        { objectId, rootHash },
    )
}

/** 使 Sidecar 对象失效（触发关联证书吊销 + CRL 发布） */
export function deleteSidecarObject(objectId: string) {
    return request.delete<boolean>(`/sidecar/objects/${objectId}`)
}
