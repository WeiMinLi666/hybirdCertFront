import request from '@/utils/request'
import type {
    CertificateInfo,
    CertChainInfo,
    CrlInfo,
    RevokeReq,
} from '@/types'

/** 检索证书详情 */
export function getCertificate(serial: string) {
    return request.get<CertificateInfo>(`/ca/certificates/${serial}`)
}

/** 获取证书链 */
export function getCertChain(serial: string) {
    return request.get<CertChainInfo>(`/ca/certificates/${serial}/chain`)
}

/** 吊销证书 */
export function revokeCertificate(serial: string, data: RevokeReq) {
    return request.post<void>(`/ca/certificates/${serial}/revoke`, data)
}

/** 获取 CRL */
export function getCrl(caId?: string) {
    return request.get<CrlInfo>('/ca/crl', { params: { caId } })
}
