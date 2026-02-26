// ========================
// GB/T 35114 混合证书系统 — 全量 DTO 类型定义
// ========================

/** 后端统一响应结构 */
export interface ApiResponse<T> {
    code: string       // "0000" 代表成功
    message: string
    data: T
}

// ========================
// Enrollment 模块
// ========================

/** 标准 CSR 申请请求 */
export interface EnrollCsrReq {
    principalCode: string
    csrPem: string
    nonce: string
}

/** 标准 CSR 申请响应 */
export interface EnrollCsrRes {
    requestId: string
    status: string
    message: string
}

/** 混合签名证书申请请求 */
export interface EnrollHybridReq {
    principalCode: string
    csrPem: string
    pqcAlg: string
    pqcPublicKeyBase64: string
    pqcSignature: string
    sm2Signature: string
    nonce: string
}

/** 混合签名证书申请响应 */
export interface EnrollHybridRes {
    requestId: string
    status: string
    message: string  // 签发成功时为证书 PEM 原文
}

/** 混合加密证书申请请求 */
export interface EnrollEncryptionReq {
    principalCode: string
    targetPrincipalId?: string
    pqcAlg: string
    nonce: string
}

/** 混合加密证书申请响应 */
export interface EnrollEncryptionRes {
    requestId: string
    status: string
    certificatePem: string
    kmcKeyId: string
    distributionId: string
    kmcDistributionUrl: string
}

/** 申请请求详情 */
export interface EnrollRequestInfo {
    requestId: string
    status: string
    message: string
    createdAt: string
}

/** 申请请求结果 */
export interface EnrollRequestResult {
    requestId: string
    status: string
    certificatePem?: string
    message?: string
}

// ========================
// CA 模块
// ========================

/** 证书详细信息 */
export interface CertificateInfo {
    serial: string
    subjectDn: string
    issuerDn: string
    notBefore: string
    notAfter: string
    status: string
    pem: string
    algorithm: string
    pqcAlg?: string
    fingerprint?: string
}

/** 证书链信息 */
export interface CertChainInfo {
    chain: string[]
}

/** CRL 信息 */
export interface CrlInfo {
    crlPem: string
    crlUrl: string
}

/** 吊销请求 */
export interface RevokeReq {
    revokeReason: string
}

// ========================
// KMC 模块
// ========================

/** KMC 密钥信息（与后端 KmcKeyResponseDTO 对齐） */
export interface KmcKeyInfo {
    keyId: string
    ownerPrincipalId: string
    usage: string
    sm2PublicKey: string
    pqcAlg: string
    pqcPublicKey: string
    status: string
}

// ========================
// Sidecar 模块
// ========================

/** Sidecar 对象信息 */
export interface SidecarObjectInfo {
    objectId: string
    size: number
    hash: string
    createdAt: string
    contentType: string
}

/** Sidecar 验证结果 */
export interface SidecarVerifyResult {
    verified: boolean
    objectId: string
    rootHash: string
}

// ========================
// Admin 模块
// ========================

/** PQC 策略配置 */
export interface PqcPolicy {
    name: string
    enabled: boolean
    pqcAlg: string
    /** 默认签名算法（混合证书），如 ML-DSA-65 */
    defaultSignAlg: string
    /** 默认加密算法（加密证书），如 ML-KEM-768 */
    defaultEncAlg: string
    securityLevel: string
    version: number
    effectiveFrom?: string
}

/** Sidecar 配置 */
export interface SidecarConfig {
    storageProvider: string
    bucket: string
    urlTtlSeconds: number
    hashAlg: string
    merkleParams: string
    version: number
}

// ========================
// 通用 / 辅助
// ========================

/** 审计事件 */
export interface AuditEvent {
    eventId: string
    eventTime: string
    eventType: string
    actorPrincipalId?: string
    actorAdminId?: string
    objectType: string
    objectId: string
    result: string
    message?: string
    traceId?: string
    requestId?: string
    ip?: string
}

/** 菜单项 */
export interface MenuItem {
    path: string
    title: string
    icon: string
    children?: MenuItem[]
}
