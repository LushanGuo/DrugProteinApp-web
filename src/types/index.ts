// 化合物接口定义（与后端保持一致）
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

// 分页响应接口
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
}

// 评分结果接口（与后端保持一致）
export interface ScoringResult {
    compoundId: number;
    totalScore: number;
    potencyScore: number;       // 效能评分（对应后端的 potencyScore）
    safetyScore: number;        // 安全性评分（对应后端的 safetyScore）
    druglikenessScore: number;  // 类药性评分
    vetoed: boolean;            // 是否被一票否决
    adviceTags: string[];       // 建议标签（对应后端的 adviceTags）
    expertAdvice: string;       // 专家建议
}

// 导航参数列表
export type RootStackParamList = {
    Login: { registeredPhone?: string };
    Register: undefined;
    ForgotPassword: undefined;
    Home: undefined;
    Detail: { compound: Compound };
    Report: { compoundId: number; compoundName: string };
    AdvancedAnalysis: { compoundId: number; compoundName: string };
};

