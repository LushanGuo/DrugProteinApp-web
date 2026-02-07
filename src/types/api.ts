// src/types/api.ts - 后端接口类型定义

// 用户认证相关接口
export interface RegisterData {
  phone: string;
  email: string;
  password: string;
  purpose?: string;  // 可选字段
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

// 注册响应（返回用户信息）
export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    phone: string;
    email: string;
    purpose?: string;
    isActive: boolean;
    createdAt: string;
  };
}

// 登录响应（返回 token）
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    type: string;        // "Bearer"
    expiresIn: number;   // 86400000 (24小时，毫秒)
  };
}

// 通用认证响应（兼容旧代码）
export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Compound {
  id: number;
  name: string;
  englishName: string;
  smiles: string;
  molecularWeight: number;
  logP: number;
  category: string;
  description: string;
  receptorPdb?: string;       // 受体蛋白 PDB 数据（可选）
  ligandPdbqt?: string;       // 配体 PDBQT 数据（可选）
  rawPdbqtContent?: string;   // 原始 PDBQT 内容
  heavyAtomCount?: number;    // 重原子数
  hbd?: number;               // 氢键供体数
  hba?: number;               // 氢键受体数
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface ScoringResult {
  compoundId: number;
  totalScore: number;
  potencyScore: number;      // 效能评分（对应后端的 potencyScore）
  safetyScore: number;       // 安全性评分（对应后端的 safetyScore）
  druglikenessScore: number; // 类药性评分
  vetoed: boolean;           // 是否被一票否决
  adviceTags: string[];      // 建议标签（对应后端的 adviceTags）
  expertAdvice: string;      // 专家建议
}

export interface StructureData {
  compoundId: number;
  compoundName: string;
  receptorPdb: string;
  ligandPdbqt: string;
}

export interface RankedCompound {
  id: number;
  name: string;
  englishName: string;
  affinity: number;
  rank: number;
  category: string;
}

export interface Visual3DData {
  proteinPdb: string;
  dockedLigandPdbqt: string;
  bindingEnergy: number;
}

// 通用 API 响应格式
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// 分子对接结果
export interface DockingResult {
  id: number;
  compoundId: number;
  affinity: number;              // 结合亲和力 (kcal/mol)
  status: string;                // completed, pending, failed
  dockedPdbqtContent: string;    // 对接后的 PDBQT 内容
  similarityScore: number;       // 相似度分数 (0.0-1.0)
  updatedAt: string;
}

// ADMET 预测结果
export interface AdmetResult {
  id: number;
  compoundId: number;
  hergToxicity: number;          // hERG 心脏毒性 (0-1)，值越低越好
  amesToxicity: number;          // Ames 致突变性 (0=阴性/安全, 1=阳性/有风险)
  liverToxicity: number;         // 肝毒性 (0=无, 1=有)
  absorption: number | null;     // 吸收性 (0-1)，值越高越好，可能为 null
  metabolism: number | null;     // 代谢稳定性 (0-1)，值越高越好，可能为 null
  updatedAt: string;
}
