import request from '@/utils/request'
import type {
    EnrollCsrReq,
    EnrollCsrRes,
    EnrollHybridReq,
    EnrollHybridRes,
    EnrollEncryptionReq,
    EnrollEncryptionRes,
    EnrollRequestInfo,
    EnrollRequestResult,
} from '@/types'

/** 标准国密 CSR 申请 */
export function enrollCsr(data: EnrollCsrReq) {
    return request.post<EnrollCsrRes>('/enroll/csr', data)
}

/** 混合签名证书申请 */
export function enrollHybrid(data: EnrollHybridReq) {
    return request.post<EnrollHybridRes>('/enroll/hybrid', data)
}

/** 混合加密证书申请 */
export function enrollEncryption(data: EnrollEncryptionReq) {
    return request.post<EnrollEncryptionRes>('/enroll/encryption', data)
}

/** 查询申请请求 */
export function getEnrollRequest(requestId: string) {
    return request.get<EnrollRequestInfo>(`/enroll/requests/${requestId}`)
}

/** 查询申请请求结果 */
export function getEnrollRequestResult(requestId: string) {
    return request.get<EnrollRequestResult>(`/enroll/requests/${requestId}/result`)
}
