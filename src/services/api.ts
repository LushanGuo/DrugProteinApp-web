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
  AdmetResult,
  AdvancedScoringResult,
  WeightInfo,
  InteractionResult,
  DrugLikenessResult,
  QsarResult,
  SelectivityResult,
  ConsensusDockingResult,
  MdSimulationResult,
  EnsembleDockingResult,
  GnnPredictionResult,
  MoleculeGenerationResult
} from '../types/api';
import { saveUserToken } from '../utils/storage';

// 根据运行环境自动选择 API 地址
const API_BASE_URL = 'http://192.168.145.1:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  async (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url);
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
    if (error.response?.status === 401) {
      console.log('🔒 Token 无效或过期，需要重新登录');
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 1. 化合物相关 API
// ============================================================
export const compoundAPI = {
  getList: (page = 0, size = 10, keyword = '') => {
    return api.get<PageResponse<Compound>>('/api/compounds', {
      params: { page, size, keyword },
    });
  },
  getDetail: (id: number) => {
    return api.get<Compound>(`/api/compounds/${id}`);
  },
  getStructure: (id: number) => {
    return api.get<StructureData>(`/api/compounds/${id}/structure`);
  },
  getTop10: () => {
    return api.get<RankedCompound[]>('/api/compounds/top10');
  },
  getByCategory: (categoryName: string) => {
    return api.get<Compound[]>(`/api/compounds/category/${encodeURIComponent(categoryName)}`);
  },
};

// ============================================================
// 2. 3D 可视化 API
// ============================================================
export const visualAPI = {
  get3DData: (compoundId: number) => {
    return api.get<Visual3DData>(`/api/visual/${compoundId}`);
  },
};

// ============================================================
// 3. 基础分析评分 API
// ============================================================
export const analysisAPI = {
  calculateScore: (compoundId: number) => {
    return api.post<ScoringResult>(`/api/analysis/${compoundId}/calculate`);
  },
};

// ============================================================
// 4. 认证 API
// ============================================================
export const authAPI = {
  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/auth/register', userData);
    return response.data;
  },
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log('🔐 登录请求参数:', {
      phoneOrEmail: credentials.phone,
      password: '******'
    });
    const response = await api.post<LoginResponse>('/api/auth/login', {
      phoneOrEmail: credentials.phone,
      password: credentials.password,
    });
    console.log('✅ 登录响应:', {
      success: response.data.success,
      message: response.data.message,
      hasToken: !!response.data.data?.token
    });
    if (response.data.success && response.data.data?.token) {
      await saveUserToken(response.data.data.token);
      console.log('Token 已保存:', response.data.data.token.substring(0, 20) + '...');
    }
    return response.data;
  },
  checkPhone: async (phone: string): Promise<boolean> => {
    const response = await api.get<{ success: boolean; data: boolean }>(`/api/auth/check-phone/${phone}`);
    return response.data.data;
  },
  checkEmail: async (email: string): Promise<boolean> => {
    const response = await api.get<{ success: boolean; data: boolean }>(`/api/auth/check-email/${encodeURIComponent(email)}`);
    return response.data.data;
  },
  logout: async (): Promise<void> => {
    const { clearUserData } = await import('../utils/storage');
    await clearUserData();
    console.log('用户已登出，本地数据已清除');
  },
  health: async (): Promise<string> => {
    const response = await api.get<{ success: boolean; data: string }>('/api/auth/health');
    return response.data.data;
  },
  sendResetCode: async (phone: string): Promise<void> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/auth/forgot-password/send-code',
      { phone }
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },
  verifyResetCode: async (phone: string, code: string): Promise<void> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/auth/forgot-password/verify-code',
      { phone, code }
    );
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },
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

// ============================================================
// 5. 分子对接 API
// ============================================================
export const dockingAPI = {
  submitDocking: async (compoundId: number): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(
      '/api/docking/submit',
      null,
      { params: { compoundId } }
    );
    return response.data;
  },
  getResultById: async (taskId: number): Promise<ApiResponse<DockingResult>> => {
    const response = await api.get<ApiResponse<DockingResult>>(
      `/api/docking/result/${taskId}`
    );
    return response.data;
  },
  getResultByCompoundId: async (compoundId: number): Promise<ApiResponse<DockingResult>> => {
    const response = await api.get<ApiResponse<DockingResult>>(
      `/api/docking/result/compound/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 6. ADMET API
// ============================================================
export const admetAPI = {
  predict: async (compoundId: number): Promise<ApiResponse<AdmetResult>> => {
    const response = await api.post<ApiResponse<AdmetResult>>(
      '/api/admet/predict',
      null,
      { params: { compoundId } }
    );
    return response.data;
  },
  getResultByCompoundId: async (compoundId: number): Promise<ApiResponse<AdmetResult>> => {
    const response = await api.get<ApiResponse<AdmetResult>>(
      `/api/admet/result/compound/${compoundId}`
    );
    return response.data;
  },
  getResultById: async (id: number): Promise<ApiResponse<AdmetResult>> => {
    const response = await api.get<ApiResponse<AdmetResult>>(
      `/api/admet/result/${id}`
    );
    return response.data;
  },
};

// ============================================================
// 7. 高级评分（AHP+熵权法）API
// ============================================================
export const advancedAnalysisAPI = {
  calculateScore: async (compoundId: number): Promise<ApiResponse<AdvancedScoringResult>> => {
    const response = await api.get<ApiResponse<AdvancedScoringResult>>(
      `/api/advanced/score/${compoundId}`
    );
    return response.data;
  },
  getWeights: async (): Promise<ApiResponse<WeightInfo>> => {
    const response = await api.get<ApiResponse<WeightInfo>>(
      '/api/advanced/weights'
    );
    return response.data;
  },
};

// ============================================================
// 8. 类药性评估 API
// ============================================================
export const drugLikenessAPI = {
  /**
   * 获取已有的类药性评估结果（查询）
   */
  getByCompoundId: async (compoundId: number): Promise<ApiResponse<DrugLikenessResult>> => {
    const response = await api.get<ApiResponse<DrugLikenessResult>>(
      `/api/drug-likeness/compound/${compoundId}`
    );
    return response.data;
  },
  /**
   * 执行类药性评估（创建/更新）
   */
  evaluate: async (compoundId: number): Promise<ApiResponse<DrugLikenessResult>> => {
    const response = await api.post<ApiResponse<DrugLikenessResult>>(
      `/api/drug-likeness/evaluate/${compoundId}`
    );
    return response.data;
  },
  /**
   * QSAR预测
   */
  predictQsar: async (compoundId: number): Promise<ApiResponse<QsarResult>> => {
    const response = await api.get<ApiResponse<QsarResult>>(
      `/api/druglikeness/qsar/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 9. 结合模式分析 API
// ============================================================
export const interactionAPI = {
  /**
   * 获取已有的结合模式分析结果（查询）
   */
  getByCompoundId: async (compoundId: number): Promise<ApiResponse<InteractionResult>> => {
    const response = await api.get<ApiResponse<InteractionResult>>(
      `/api/interaction/compound/${compoundId}`
    );
    return response.data;
  },
  /**
   * 执行结合模式分析（创建/更新）
   */
  analyze: async (compoundId: number): Promise<ApiResponse<InteractionResult>> => {
    const response = await api.post<ApiResponse<InteractionResult>>(
      `/api/interaction/analyze/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 10. 选择性分析 API
// ============================================================
export const selectivityAPI = {
  /**
   * 获取已有的选择性分析结果（查询）
   */
  getByCompoundId: async (compoundId: number): Promise<ApiResponse<SelectivityResult>> => {
    const response = await api.get<ApiResponse<SelectivityResult>>(
      `/api/selectivity/compound/${compoundId}`
    );
    return response.data;
  },
  /**
   * 执行选择性分析（创建/更新）
   */
  analyze: async (compoundId: number): Promise<ApiResponse<SelectivityResult>> => {
    const response = await api.get<ApiResponse<SelectivityResult>>(
      `/api/selectivity/analyze/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 11. 共识对接 API
// ============================================================
export const consensusAPI = {
  analyze: async (compoundId: number): Promise<ApiResponse<ConsensusDockingResult>> => {
    const response = await api.get<ApiResponse<ConsensusDockingResult>>(
      `/api/consensus/analyze/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 12. MD模拟 API
// ============================================================
export const mdSimulationAPI = {
  simulate: async (compoundId: number): Promise<ApiResponse<MdSimulationResult>> => {
    const response = await api.get<ApiResponse<MdSimulationResult>>(
      `/api/md/simulate/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 13. Ensemble对接 API
// ============================================================
export const ensembleAPI = {
  analyze: async (compoundId: number): Promise<ApiResponse<EnsembleDockingResult>> => {
    const response = await api.get<ApiResponse<EnsembleDockingResult>>(
      `/api/ensemble/analyze/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 14. GNN预测 API
// ============================================================
export const gnnAPI = {
  predict: async (compoundId: number): Promise<ApiResponse<GnnPredictionResult>> => {
    const response = await api.get<ApiResponse<GnnPredictionResult>>(
      `/api/gnn/predict/${compoundId}`
    );
    return response.data;
  },
};

// ============================================================
// 15. AI分子生成 API
// ============================================================
export const generationAPI = {
  generate: async (target = 'CDK2', count = 10): Promise<ApiResponse<MoleculeGenerationResult>> => {
    const response = await api.get<ApiResponse<MoleculeGenerationResult>>(
      '/api/generation/generate',
      { params: { target, count } }
    );
    return response.data;
  },
};

// ============================================================
// 16. ⭐ QSAR 预测 API（新增）
// ============================================================
export const qsarAPI = {
  /**
   * 对指定化合物进行 QSAR 活性预测
   * @param compoundId 化合物ID
   * @returns 预测的亲和力 (kcal/mol)
   */
  predict: async (compoundId: number): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>(
      `/api/qsar/predict/${compoundId}`
    );
    return response.data;
  },
};

export default api;