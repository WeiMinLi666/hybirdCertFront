import request from '@/utils/request'
import type { SidecarObjectInfo, SidecarVerifyResult } from '@/types'

/** 查询 Sidecar 对象 */
export function getSidecarObject(objectId: string) {
    return request.get<SidecarObjectInfo>(`/sidecar/objects/${objectId}`)
}

/** 验证 Sidecar 对象防篡改 */
export function verifySidecarObject(objectId: string, rootHash: string) {
    return request.post<SidecarVerifyResult>(
        `/sidecar/objects/${objectId}/verify`,
        null,
        { params: { rootHash } },
    )
}
