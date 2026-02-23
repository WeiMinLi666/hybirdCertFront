import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

/**
 * 创建全局 Axios 实例
 * - 请求拦截器：注入 Token（如有）
 * - 响应拦截器：自动解包 ApiResponse<T>，非 "0000" 时全局提示错误
 */
const service: AxiosInstance = axios.create({
    baseURL: '/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ---- 请求拦截器 ----
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// ---- 响应拦截器 ----
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
        const res = response.data

        // 后端业务码判断
        if (res.code !== '0000') {
            ElMessage.error(res.message || '请求失败，请稍后重试')
            return Promise.reject(new Error(res.message || 'Error'))
        }

        // 成功时直接返回 data 字段
        return res.data as any
    },
    (error) => {
        const msg =
            error.response?.data?.message ||
            error.message ||
            '网络异常，请检查后端服务是否启动'
        ElMessage.error(msg)
        return Promise.reject(error)
    },
)

// ---- 导出类型安全的请求方法 ----
const request = {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config) as Promise<T>
    },
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config) as Promise<T>
    },
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config) as Promise<T>
    },
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config) as Promise<T>
    },
}

export default request
