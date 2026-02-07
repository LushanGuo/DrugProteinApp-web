// src/services/api.ts - API 服务封装
import axios from 'axios';
import { 
  Compound, 
  PageResponse, 
  ScoringResult, 
  StructureData, 
  RankedCompound, 
  Visual3DData,
  RegisterData,
  LoginCredentials,
  RegisterResponse,
  LoginResponse,
  ApiResponse,
  DockingResult,
  AdmetResult
} from '../types/api';
import { saveUserToken } from '../utils/storage';

// 根据运行环境自动选择 API 地址
// Android 模拟器: 10.0.2.2
// iOS 模拟器: localhost
// 真机: 你的电脑 IP 地址
const API_BASE_URL = 'http://192.168.3.254:8080'; // 根据你的实际 IP 修改

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 增加到60秒，因为对接任务可能需要较长时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  async (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    
    // 从 AsyncStorage 获取 token 并添加到请求头
    try {
      const { getUserToken } = await import('../utils/storage');
      const token = await getUserToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('获取token失败:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('✅ API响应成功:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API响应错误:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // 401 未授权 - token 过期或无效
    if (error.response?.status === 401) {
      console.log('🔒 Token 无效或过期，需要重新登录');
      // 可以在这里添加自动跳转到登录页的逻辑
    }
    
    return Promise.reject(error);
  }
);

// 化合物相关 API
export const compoundAPI = {
  /**
   * 获取化合物列表
   * @param page 页码（从0开始）
   * @param size 每页数量
   * @param keyword 搜索关键词
   * @returns 包含 receptorPdb 和 ligandPdbqt 字段的化合物列表
   */
  getList: (page = 0, size = 10, keyword = '') => {
    return api.get<PageResponse<Compound>>('/api/compounds', {
      params: { page, size, keyword },
    });
  },

  /**
   * 获取化合物详情（包含 3D 结构数据）
   * @param id 化合物ID
   * @returns 包含 receptorPdb 和 ligandPdbqt 字段的化合物详情
   */
  getDetail: (id: number) => {
    return api.get<Compound>(`/api/compounds/${id}`);
  },

  /**
   * 获取化合物的 3D 结构数据（专用接口）
   * @param id 化合物ID
   * @returns 3D 结构数据（PDB 和 PDBQT 格式）
   */
  getStructure: (id: number) => {
    return api.get<StructureData>(`/api/compounds/${id}/structure`);
  },

  /**
   * 获取 Top 10 化合物（按结合亲和力排序）
   * @returns 前 10 个结合亲和力最好的化合物
   */
  getTop10: () => {
    return api.get<RankedCompound[]>('/api/compounds/top10');
  },

  /**
   * 根据分类获取化合物
   * @param categoryName 分类名称（如：黄酮类、生物碱类）
   * @returns 该分类下的所有化合物
   */
  getByCategory: (categoryName: string) => {
    return api.get<Compound[]>(`/api/compounds/category/${encodeURIComponent(categoryName)}`);
  },
};

// 3D 可视化相关 API
export const visualAPI = {
  /**
   * 获取 3D 可视化数据（蛋白 + 对接后的配体）
   * @param compoundId 化合物ID
   * @returns 蛋白质 PDB 和对接后的配体 PDBQT
   */
  get3DData: (compoundId: number) => {
    return api.get<Visual3DData>(`/api/visual/${compoundId}`);
  },
};

// 分析相关 API
export const analysisAPI = {
  /**
   * 计算化合物评分
   * @param compoundId 化合物ID
   */
  calculateScore: (compoundId: number) => {
    return api.post<ScoringResult>(`/api/analysis/${compoundId}/calculate`);
  },
};

// 认证相关 API
export const authAPI = {
  /**
   * 用户注册
   * @param userData 注册数据
   * @returns 返回用户信息（不含 token）
   */
  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/auth/register', userData);
    return response.data;
  },

  /**
   * 用户登录
   * @param credentials 登录凭证
   * @returns 返回 token 信息
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log('🔐 登录请求参数:', {
      phoneOrEmail: credentials.phone,
      password: '******'
    });
    
    const response = await api.post<LoginResponse>('/api/auth/login', {
      phoneOrEmail: credentials.phone, // 后端需要 phoneOrEmail 字段
      password: credentials.password,
    });
    
    console.log('✅ 登录响应:', {
      success: response.data.success,
      message: response.data.message,
      hasToken: !!response.data.data?.token
    });
    
    // 存储 token
    if (response.data.success && response.data.data?.token) {
      await saveUserToken(response.data.data.token);
      console.log('Token 已保存:', response.data.data.token.substring(0, 20) + '...');
    }
    
    return response.data;
  },

  /**
   * 检查手机号是否存在
   * @param phone 手机号
   * @returns true 表示已注册，false 表示未注册
   */
  checkPhone: async (phone: string): Promise<boolean> => {
    const response = await api.get<{ success: boolean; data: boolean }>(`/api/auth/check-phone/${phone}`);
    return response.data.data;
  },

  /**
   * 检查邮箱是否存在
   * @param email 邮箱地址
   * @returns true 表示已注册，false 表示未注册
   */
  checkEmail: async (email: string): Promise<boolean> => {
    const response = await api.get<{ success: boolean; data: boolean }>(`/api/auth/check-email/${encodeURIComponent(email)}`);
    return response.data.data;
  },

  /**
   * 用户登出（清除本地 token）
   */
  logout: async (): Promise<void> => {
    const { clearUserData } = await import('../utils/storage');
    await clearUserData();
    console.log('用户已登出，本地数据已清除');
  },

  /**
   * 健康检查
   */
  health: async (): Promise<string> => {
    const response = await api.get<{ success: boolean; data: string }>('/api/auth/health');
    return response.data.data;
  },

  /**
   * 发送密码重置验证码
   * @param phone 手机号
   */
  sendResetCode: async (phone: string): Promise<void> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/auth/forgot-password/send-code',
      { phone }
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },

  /**
   * 验证重置密码验证码
   * @param phone 手机号
   * @param code 验证码
   */
  verifyResetCode: async (phone: string, code: string): Promise<void> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/auth/forgot-password/verify-code',
      { phone, code }
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },

  /**
   * 重置密码
   * @param phone 手机号
   * @param code 验证码
   * @param newPassword 新密码
   */
  resetPassword: async (phone: string, code: string, newPassword: string): Promise<void> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/auth/forgot-password/reset',
      { phone, code, newPassword }
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },
};

// 分子对接相关 API
export const dockingAPI = {
  /**
   * 提交分子对接任务（异步）
   * @param compoundId 化合物ID
   * @returns 任务提交状态
   */
  submitDocking: async (compoundId: number): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(
      '/api/docking/submit',
      null,
      { params: { compoundId } }
    );
    return response.data;
  },

  /**
   * 查询对接结果（按任务ID）
   * @param taskId 对接任务ID
   * @returns 对接结果
   */
  getResultById: async (taskId: number): Promise<ApiResponse<DockingResult>> => {
    const response = await api.get<ApiResponse<DockingResult>>(
      `/api/docking/result/${taskId}`
    );
    return response.data;
  },

  /**
   * 查询对接结果（按化合物ID）
   * @param compoundId 化合物ID
   * @returns 最新的对接结果
   */
  getResultByCompoundId: async (compoundId: number): Promise<ApiResponse<DockingResult>> => {
    const response = await api.get<ApiResponse<DockingResult>>(
      `/api/docking/result/compound/${compoundId}`
    );
    return response.data;
  },
};

// ADMET 预测相关 API
export const admetAPI = {
  /**
   * 提交 ADMET 预测任务（同步，立即返回结果）
   * @param compoundId 化合物ID
   * @returns ADMET 预测结果
   */
  predict: async (compoundId: number): Promise<ApiResponse<AdmetResult>> => {
    const response = await api.post<ApiResponse<AdmetResult>>(
      '/api/admet/predict',
      null,
      { params: { compoundId } }
    );
    return response.data;
  },

  /**
   * 查询 ADMET 结果（按化合物ID）
   * @param compoundId 化合物ID
   * @returns ADMET 预测结果
   */
  getResultByCompoundId: async (compoundId: number): Promise<ApiResponse<AdmetResult>> => {
    const response = await api.get<ApiResponse<AdmetResult>>(
      `/api/admet/result/compound/${compoundId}`
    );
    return response.data;
  },

  /**
   * 查询 ADMET 结果（按结果ID）
   * @param id ADMET 结果ID
   * @returns ADMET 预测结果
   */
  getResultById: async (id: number): Promise<ApiResponse<AdmetResult>> => {
    const response = await api.get<ApiResponse<AdmetResult>>(
      `/api/admet/result/${id}`
    );
    return response.data;
  },
};

export default api;
