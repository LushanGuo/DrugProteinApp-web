// src/services/api.ts
import axios from 'axios';
import { Compound, PageResponse, ScoringResult } from '../types';
import { config } from '../config';

// 创建 axios 实例
const api = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: config.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器（可选：添加 token 等）
api.interceptors.request.use(
    (config) => {
        console.log('API请求:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器（统一错误处理）
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API错误:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
        return Promise.reject(error);
    }
);

// 化合物 API 服务
export const compoundAPI = {
    /**
     * 获取化合物列表（支持分页和搜索）
     * @param page 页码（从0开始）
     * @param size 每页数量
     * @param keyword 搜索关键词（可选）
     */
    getList: async (
        page: number = 0,
        size: number = 10,
        keyword: string = ''
    ): Promise<PageResponse<Compound>> => {
        try {
            const params: any = { page, size };
            if (keyword) {
                params.keyword = keyword;
            }
            const response = await api.get('/compounds', { params });
            return response.data;
        } catch (error) {
            console.error('获取化合物列表失败:', error);
            throw error;
        }
    },

    /**
     * 获取所有化合物（一次性加载，用于前端筛选）
     * @param size 最大数量，默认100
     */
    getAllCompounds: async (size: number = 100): Promise<Compound[]> => {
        try {
            const response = await api.get('/compounds', {
                params: { page: 0, size }
            });
            return response.data.content;
        } catch (error) {
            console.error('获取所有化合物失败:', error);
            throw error;
        }
    },

    /**
     * 获取化合物详情
     * @param id 化合物ID
     */
    getDetail: async (id: number): Promise<Compound> => {
        try {
            const response = await api.get(`/compounds/${id}`);
            return response.data;
        } catch (error) {
            console.error(`获取化合物详情失败 (ID: ${id}):`, error);
            throw error;
        }
    },

    /**
     * 计算化合物评分
     * @param compoundId 化合物ID
     */
    calculateScore: async (compoundId: number): Promise<ScoringResult> => {
        try {
            const response = await api.post(`/analysis/${compoundId}/calculate`);
            return response.data;
        } catch (error) {
            console.error(`计算评分失败 (ID: ${compoundId}):`, error);
            throw error;
        }
    },
};

// 导出 axios 实例（供其他服务使用）
export default api;