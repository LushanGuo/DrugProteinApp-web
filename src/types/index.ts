// 化合物接口定义
export interface Compound {
    id: number;
    name: string;
    englishName: string;
    smiles: string;
    molecularWeight: number;
    logP: number;
    category: string;
    description: string;
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

// 评分结果接口
export interface ScoringResult {
    compoundId: number;
    totalScore: number;
    potencyScore: number;       // 效能评分 (原 affinityScore)
    safetyScore: number;        // 安全评分 (原 admetScore)
    druglikenessScore: number;  // 成药性评分
    isVetoed: boolean;          // 是否触发熔断 (一票否决)
    adviceTags: string[];       // 建议标签 (混合了优缺点)
    expertAdvice: string;       // 专家建议
}

// 导航参数列表
export type RootStackParamList = {
    Home: undefined;
    Detail: { compound: Compound };
    Report: { compoundId: number; compoundName: string };
};
