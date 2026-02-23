# GB/T 35114 混合证书系统前端项目生成提示词

## 核心系统介绍
这是一个基于 GB/T 35114 标准构建的抗量子（PQC）与国密（SM2）混合证书管理系统。后端采用 Spring Boot 微服务架构，核心模块包括：
1. **Enrollment (证书注册与统一编排)**
2. **CA (证书管理与吊销)**
3. **KMC (密钥管理中心)**
4. **Sidecar (大对象存储)**
5. **Admin (系统管理与策略配置)**

---

## 你的角色与任务
你现在是一位资深的资深前端架构师与全栈开发专家。你的任务是：根据本文档提供的技术栈、页面拓扑结构以及全量 API 接口定义，从零开始直接生成一个完整、现代、高可用的前端工程代码。

---

## 1. 技术栈要求
请使用以下现代前端技术栈来搭建工程：
- **核心框架**: Vue 3 (Composition API, `<script setup>`) 或 React 18 (Functional Components, Hooks)。*（请在生成时自行决定使用其中之一，建议使用 Vue 3 以契合国内企业级后台开发习惯）*
- **构建工具**: Vite
- **开发语言**: TypeScript (必须严格定义后端对应的 DTO Interface)
- **UI 组件库**: Element Plus (若用 Vue) 或 Ant Design (若用 React)
- **CSS 框架**: Tailwind CSS (用于快速灵活的原子类布局)
- **网络请求**: Axios (需配置全局请求/响应拦截器，统一处理鉴权及后端 `Response<T>` 标准结构)
- **路由状态**: Vue Router + Pinia (若用 Vue) 或 React Router + Zustand (若用 React)

---

## 2. 页面拓扑与功能模块编排

布局应为经典的后台管理系统布局：**左侧边栏菜单 (Sidebar) + 顶栏 (Header) + 中间核心内容区 (Main Content)**。

### 模块一：概览大盘 (Dashboard/Home)
- 展示系统基本信息，快捷入口。

### 模块二：证书申请工作台 (Enrollment Center)
- **标准国密申请 (Legacy)**: 表单提交申请人的 Principal ID 和 SM2 CSR。
- **混合签名证书申请 (Hybrid Signature)**: 表单提交 CSR、SM2签名、PQC 算法、PQC 公钥、PQC 签名，或者提供 Multipart 文件上传。
- **混合加密证书申请 (Hybrid Encryption)**: 最简表单，仅需输入 Principal ID 和 PQC 算法 (如 `ML-KEM-768`)，点击申请后，系统应立即展示下发的证书原文及 KMC 密钥下发信封(Sidecar URL)。

### 模块三：证书管理中心 (Certificate Management)
- **证书检索**: 输入证书序列号 (Serial) 检索证书详细信息及 PEM 原文，包含下载按钮。
- **证书链与 CRL**: 提供拉取当前 CA 证书链及下载最新/轻量级 CRL(包含 Sidecar 大对象 URL) 的独立视图。
- **证书吊销面板**: 输入序列号进行吊销操作。

### 模块四：KMC 与 Sidecar 实验室 (DevTools/Ops)
- **KMC 密钥查询**: 输入 Key ID 检索 KMC 密钥状态信息，提供禁用密钥接口调用。
- **Sidecar 防篡改验证**: 输入 Object ID 和预期的 Root Hash，调用后端对大对象(例如 PQC公钥或巨大的 CRL) 进行完整性验证。

### 模块五：系统配置与策略 (System Admin)
- **PQC 策略配置**: 表单读取与更新系统的 PQC 密码学策略 (自动过期时间，默认使用算法等)。
- **Sidecar 配置**: 表单读取与更新分布式存储提供商、Bucket 和 Hash 算法配置。

---

## 3. 全局 Axios 拦截器与标准结构设定

后端统一返回 `Response<T>` 格式，前端在 Axios 的响应拦截器中需做自动解包与全局错误提示：
```typescript
interface ApiResponse<T> {
  code: string;       // "0000" 代表成功
  message: string;
  data: T;
}
// 若 code !== "0000"，系统应全局弹出 Error Message 控制台/Toast
```

---

## 4. 后端全量 API 接口定义清单 (供 TypeScript 接口生成使用)

### 4.1 核心注册编排 API `/api/v1/enroll`
1. `POST /api/v1/enroll/csr` 
   - Req DTO: `{ principalCode, csrPem, nonce }`
   - Res DTO: `{ requestId, status, message }`
2. `POST /api/v1/enroll/hybrid`
   - Req DTO: `{ principalCode, csrPem, pqcAlg, pqcPublicKeyBase64, pqcSignature, sm2Signature, nonce }`
   - Res DTO: `{ requestId, status, message: string (签发成功时为证书PEM原文) }`
3. `POST /api/v1/enroll/encryption`
   - Req DTO: `{ principalCode, targetPrincipalId, pqcAlg, nonce }`
   - Res DTO: `{ requestId, status, certificatePem, kmcDistributionUrl }`
4. `GET /api/v1/enroll/requests/{requestId}`
5. `GET /api/v1/enroll/requests/{requestId}/result`

### 4.2 CA 业务 API `/api/v1/ca`
1. `GET /api/v1/ca/certificates/{serial}`
2. `GET /api/v1/ca/certificates/{serial}/chain`
3. `POST /api/v1/ca/certificates/{serial}/revoke` (Payload: `{ revokeReason }`)
4. `GET /api/v1/ca/crl` (Querystring: `?caId=xxx`) -> 返回 `{ crlPem, crlUrl (Sidecar地址) }`

### 4.3 KMC 业务 API `/api/v1/kmc`
1. `GET /api/v1/kmc/keys/{keyId}`
2. `PUT /api/v1/kmc/keys/{keyId}/disable`

### 4.4 Sidecar 业务 API `/api/v1/sidecar`
1. `GET /api/v1/sidecar/objects/{objectId}`
2. `POST /api/v1/sidecar/objects/{objectId}/verify` (Querystring: `?rootHash=xxx`) -> Boolean

### 4.5 后台管理 API `/api/v1/admin`
1. `GET /api/v1/admin/pqc-policy`
2. `PUT /api/v1/admin/pqc-policy` 
   - Payload: `{ name, enabled, pqcAlg, securityLevel, paramsJson, version }`
3. `GET /api/v1/admin/sidecar-config`
4. `PUT /api/v1/admin/sidecar-config`
   - Payload: `{ storageProvider, bucket, urlTtlSeconds, hashAlg, merkleParams, version }`

---

## 5. 项目代码生成指令
请你的回答直接分为以下几个步骤输出代码：
1. **Step 1: 基础工程搭建与配置** 
   提供 `package.json`、`vite.config.ts`、`tailwind.config.js` 的配置内容。
2. **Step 2: API 接口与类型定义** 
   创建 `src/api/index.ts` 及 `src/types/index.ts`，实现所有的 Axios 调用与 TS 强类型定义。
3. **Step 3: 核心路由与全局组件** 
   实现左侧边栏布局与 `vue-router` / `react-router` 定义。
4. **Step 4: 关键页面开发 (提供完整核心代码)**
   - 必须详细实现 **模块二 (加密证书及混合签名申请表单页面)**
   - 必须详细实现 **模块三 (证书检索与吊销中心)**
   - 必须详细实现 **模块五 (系统配置表单页)**

要求：代码规范、注释清晰、处理好各种网络加载态（Loading Spinner）与异常边界。直接开始生成核心代码即可！
