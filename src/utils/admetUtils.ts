// src/utils/admetUtils.ts - ADMET 数据处理工具

import { AdmetResult } from '../types/api';

/**
 * ADMET 五维雷达图数据接口
 */
export interface RadarChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

/**
 * 将 ADMET 结果转换为五维雷达图数据
 * 
 * 后端返回5个字段，但 absorption 和 metabolism 可能为 null：
 * - hergToxicity (0-1): hERG心脏毒性，值越低越好
 * - amesToxicity (0或1): Ames致突变性，0=安全
 * - liverToxicity (0或1): 肝毒性，0=安全
 * - absorption (0-1 或 null): 吸收性，值越高越好
 * - metabolism (0-1 或 null): 代谢稳定性，值越高越好
 * 
 * 当 absorption 或 metabolism 为 null 时，使用默认值
 */
export function getRadarData(admet: AdmetResult): RadarChartData {
  // 如果 absorption 或 metabolism 为 null，使用默认值
  const absorptionValue = admet.absorption !== null && admet.absorption !== undefined 
    ? admet.absorption * 100 
    : 80;  // 默认值
  
  const metabolismValue = admet.metabolism !== null && admet.metabolism !== undefined 
    ? admet.metabolism * 100 
    : 75;  // 默认值
  
  return {
    labels: ['心脏安全性', '致突变性', '肝脏安全性', '吸收性', '代谢稳定性'],
    datasets: [{
      data: [
        (1 - admet.hergToxicity) * 100,  // 心脏安全性（反转，0-100）
        admet.amesToxicity === 0 ? 100 : 0,  // 致突变性（反转，0或100）
        admet.liverToxicity === 0 ? 100 : 0,  // 肝脏安全性（反转，0或100）
        absorptionValue,  // 吸收性（真实数据或默认值）
        metabolismValue,  // 代谢稳定性（真实数据或默认值）
      ]
    }]
  };
}

/**
 * 获取 hERG 毒性风险等级
 */
export function getHergRiskLevel(hergToxicity: number): {
  level: string;
  color: string;
  description: string;
} {
  if (hergToxicity < 0.3) {
    return {
      level: '低风险',
      color: '#4CAF50',
      description: 'hERG毒性低，心脏安全性好'
    };
  } else if (hergToxicity < 0.7) {
    return {
      level: '中等风险',
      color: '#FFA726',
      description: 'hERG毒性中等，需要进一步评估'
    };
  } else {
    return {
      level: '高风险',
      color: '#EF5350',
      description: 'hERG毒性高，可能影响心脏功能'
    };
  }
}

/**
 * 获取 Ames 致突变性描述
 */
export function getAmesDescription(amesToxicity: number): {
  status: string;
  color: string;
  description: string;
} {
  if (amesToxicity === 0) {
    return {
      status: '阴性',
      color: '#4CAF50',
      description: '无致突变性，安全'
    };
  } else {
    return {
      status: '阳性',
      color: '#EF5350',
      description: '有致突变性，存在风险'
    };
  }
}

/**
 * 获取肝毒性描述
 */
export function getLiverToxicityDescription(liverToxicity: number): {
  status: string;
  color: string;
  description: string;
} {
  if (liverToxicity === 0) {
    return {
      status: '无肝毒性',
      color: '#4CAF50',
      description: '对肝脏安全'
    };
  } else {
    return {
      status: '有肝毒性',
      color: '#EF5350',
      description: '可能对肝脏造成损害'
    };
  }
}

/**
 * 获取吸收性描述
 */
export function getAbsorptionDescription(absorption: number | null | undefined): {
  level: string;
  color: string;
  description: string;
} {
  if (absorption === null || absorption === undefined) {
    return {
      level: '未知',
      color: '#9E9E9E',
      description: '吸收性数据暂未预测（使用默认值80%）'
    };
  }
  
  if (absorption >= 0.7) {
    return {
      level: '优秀',
      color: '#4CAF50',
      description: '吸收性好，生物利用度高'
    };
  } else if (absorption >= 0.4) {
    return {
      level: '良好',
      color: '#8BC34A',
      description: '吸收性中等，可接受'
    };
  } else {
    return {
      level: '较差',
      color: '#FFA726',
      description: '吸收性差，生物利用度低'
    };
  }
}

/**
 * 获取代谢稳定性描述
 */
export function getMetabolismDescription(metabolism: number | null | undefined): {
  level: string;
  color: string;
  description: string;
} {
  if (metabolism === null || metabolism === undefined) {
    return {
      level: '未知',
      color: '#9E9E9E',
      description: '代谢稳定性数据暂未预测（使用默认值75%）'
    };
  }
  
  if (metabolism >= 0.7) {
    return {
      level: '稳定',
      color: '#4CAF50',
      description: '代谢稳定性好，药效持久'
    };
  } else if (metabolism >= 0.4) {
    return {
      level: '中等',
      color: '#8BC34A',
      description: '代谢稳定性中等'
    };
  } else {
    return {
      level: '不稳定',
      color: '#FFA726',
      description: '代谢快，药效持续时间短'
    };
  }
}

/**
 * 计算 ADMET 综合安全性评分 (0-100)
 * 包含所有5个指标的加权平均，absorption 和 metabolism 为 null 时使用默认值
 */
export function calculateAdmetSafetyScore(admet: AdmetResult): number {
  const heartSafety = (1 - admet.hergToxicity) * 100;  // 心脏安全性
  const mutagenicity = admet.amesToxicity === 0 ? 100 : 0;  // 致突变性
  const liverSafety = admet.liverToxicity === 0 ? 100 : 0;  // 肝脏安全性
  
  // 如果 absorption 或 metabolism 为 null，使用默认值
  const absorptionScore = admet.absorption !== null && admet.absorption !== undefined 
    ? admet.absorption * 100 
    : 80;
  
  const metabolismScore = admet.metabolism !== null && admet.metabolism !== undefined 
    ? admet.metabolism * 100 
    : 75;
  
  // 加权平均：心脏25%，致突变20%，肝脏20%，吸收20%，代谢15%
  return (
    heartSafety * 0.25 + 
    mutagenicity * 0.20 + 
    liverSafety * 0.20 + 
    absorptionScore * 0.20 + 
    metabolismScore * 0.15
  );
}

/**
 * 获取 ADMET 综合评价
 */
export function getAdmetOverallAssessment(admet: AdmetResult): {
  score: number;
  grade: string;
  color: string;
  recommendation: string;
} {
  const score = calculateAdmetSafetyScore(admet);
  
  if (score >= 80) {
    return {
      score,
      grade: '优秀',
      color: '#4CAF50',
      recommendation: 'ADMET性质优秀，安全性高，建议优先考虑'
    };
  } else if (score >= 60) {
    return {
      score,
      grade: '良好',
      color: '#8BC34A',
      recommendation: 'ADMET性质良好，可以进一步研究'
    };
  } else if (score >= 40) {
    return {
      score,
      grade: '一般',
      color: '#FFA726',
      recommendation: 'ADMET性质一般，需要优化或谨慎使用'
    };
  } else {
    return {
      score,
      grade: '较差',
      color: '#EF5350',
      recommendation: 'ADMET性质较差，存在安全隐患，不建议使用'
    };
  }
}
