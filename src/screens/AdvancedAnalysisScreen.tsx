// src/screens/AdvancedAnalysisScreen.tsx - 高级分析页面
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
    advancedAnalysisAPI,
    interactionAPI,
    drugLikenessAPI,
    selectivityAPI,
    consensusAPI,
    mdSimulationAPI,
    ensembleAPI,
    gnnAPI,
    generationAPI,
    qsarAPI,
} from '../services/api';
import {
    AdvancedScoringResult,
    InteractionResult,
    DrugLikenessResult,
    SelectivityResult,
    ConsensusDockingResult,
    MdSimulationResult,
    EnsembleDockingResult,
    GnnPredictionResult,
    MoleculeGenerationResult,
} from '../types/api';
import { InteractionDiagram } from '../components/InteractionDiagram';

type AdvancedAnalysisScreenRouteProp = RouteProp<RootStackParamList, 'AdvancedAnalysis'>;
type AdvancedAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdvancedAnalysis'>;

interface Props {
    route: AdvancedAnalysisScreenRouteProp;
    navigation: AdvancedAnalysisScreenNavigationProp;
}

// 功能模块配置
const MODULES = [
    {
        id: 'scoring',
        name: '智能评分系统',
        description: 'AHP层次分析法 + 熵权法组合赋权',
        icon: 'calculator-variant',
        color: '#4CAF50',
        priority: '必做',
    },
    {
        id: 'interaction',
        name: '结合模式分析',
        description: '氢键、疏水作用、关键氨基酸分析',
        icon: 'molecule',
        color: '#2196F3',
        priority: '必做',
    },
    {
        id: 'druglikeness',
        name: '类药性评估',
        description: 'Lipinski五规则、Veber规则',
        icon: 'flask',
        color: '#FF9800',
        priority: '推荐',
    },
    {
        id: 'qsar',
        name: 'QSAR 活性预测',
        description: '随机森林模型预测结合亲和力',
        icon: 'chart-scatter-plot',
        color: '#E91E63',
        priority: '推荐',
    },
    {
        id: 'selectivity',
        name: '选择性分析',
        description: 'CDK家族选择性指数计算',
        icon: 'target-variant',
        color: '#9C27B0',
        priority: '推荐',
    },
    {
        id: 'consensus',
        name: '共识对接',
        description: '多打分函数共识，降低假阳性',
        icon: 'vote-outline',
        color: '#00BCD4',
        priority: '推荐',
    },
    {
        id: 'md',
        name: 'MD分子动力学',
        description: '100ns GROMACS模拟分析',
        icon: 'wave',
        color: '#795548',
        priority: '进阶',
    },
    {
        id: 'ensemble',
        name: 'Ensemble对接',
        description: '多构象集成对接，考虑蛋白柔性',
        icon: 'layers',
        color: '#607D8B',
        priority: '进阶',
    },
    {
        id: 'gnn',
        name: 'GNN深度学习预测',
        description: '图神经网络结合亲和力预测',
        icon: 'brain',
        color: '#E91E63',
        priority: '进阶',
    },
    {
        id: 'generation',
        name: 'AI分子生成',
        description: '基于CDK2靶点生成全新抑制剂分子',
        icon: 'creation',
        color: '#FF5722',
        priority: '进阶',
    },
];

export default function AdvancedAnalysisScreen({ route, navigation }: Props) {
    const { compoundId, compoundName } = route.params;

    // 各模块数据状态
    const [scoringData, setScoringData] = useState<AdvancedScoringResult | null>(null);
    const [interactionData, setInteractionData] = useState<InteractionResult | null>(null);
    const [druglikenessData, setDruglikenessData] = useState<DrugLikenessResult | null>(null);
    const [qsarData, setQsarData] = useState<number | null>(null);
    const [selectivityData, setSelectivityData] = useState<SelectivityResult | null>(null);
    const [consensusData, setConsensusData] = useState<ConsensusDockingResult | null>(null);
    const [mdData, setMdData] = useState<MdSimulationResult | null>(null);
    const [ensembleData, setEnsembleData] = useState<EnsembleDockingResult | null>(null);
    const [gnnData, setGnnData] = useState<GnnPredictionResult | null>(null);
    const [generationData, setGenerationData] = useState<MoleculeGenerationResult | null>(null);

    // 加载状态
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    // 展开状态
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    // 切换展开/收起
    const toggleExpand = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    // 设置加载状态
    const setLoading = (moduleId: string, isLoading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [moduleId]: isLoading,
        }));
    };

    // 加载模块数据
    const loadModuleData = async (moduleId: string) => {
        if (loadingStates[moduleId]) return;

        setLoading(moduleId, true);
        try {
            switch (moduleId) {
                case 'scoring': {
                    const response = await advancedAnalysisAPI.calculateScore(compoundId);
                    if (response.success && response.data) {
                        setScoringData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'interaction': {
                    const response = await interactionAPI.analyze(compoundId);
                    if (response.success && response.data) {
                        setInteractionData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'druglikeness': {
                    const drugResponse = await drugLikenessAPI.evaluate(compoundId);
                    if (drugResponse.success && drugResponse.data) {
                        setDruglikenessData(drugResponse.data);
                        toggleExpand(moduleId);
                    } else {
                        Alert.alert('提示', drugResponse.message || '类药性评估失败');
                    }
                    break;
                }
                case 'qsar': {
                    const response = await qsarAPI.predict(compoundId);
                    if (response.success && response.data !== null) {
                        setQsarData(response.data);
                        toggleExpand(moduleId);
                    } else {
                        Alert.alert('提示', response.message || 'QSAR预测失败');
                    }
                    break;
                }
                case 'selectivity': {
                    const response = await selectivityAPI.analyze(compoundId);
                    if (response.success && response.data) {
                        setSelectivityData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'consensus': {
                    const response = await consensusAPI.analyze(compoundId);
                    if (response.success && response.data) {
                        setConsensusData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'md': {
                    const response = await mdSimulationAPI.simulate(compoundId);
                    if (response.success && response.data) {
                        setMdData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'ensemble': {
                    const response = await ensembleAPI.analyze(compoundId);
                    if (response.success && response.data) {
                        setEnsembleData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'gnn': {
                    const response = await gnnAPI.predict(compoundId);
                    if (response.success && response.data) {
                        setGnnData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
                case 'generation': {
                    const response = await generationAPI.generate('CDK2', 10);
                    if (response.success && response.data) {
                        setGenerationData(response.data);
                        toggleExpand(moduleId);
                    }
                    break;
                }
            }
        } catch (error: any) {
            console.error(`${moduleId} 分析失败:`, error);
            Alert.alert('分析失败', error.message || '请稍后重试');
        } finally {
            setLoading(moduleId, false);
        }
    };

    // 获取优先级颜色
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case '必做': return '#F44336';
            case '推荐': return '#FF9800';
            case '进阶': return '#9C27B0';
            default: return '#999';
        }
    };

    // 渲染评分模块内容（修正版）
    const renderScoringContent = () => {
        if (!scoringData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>总分</Text>
                    <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>
                        {scoringData.totalScore?.toFixed(1)}
                    </Text>
                </View>
                <View style={styles.threeScores}>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreItemLabel}>效能</Text>
                        <Text style={styles.scoreItemValue}>{scoringData.potencyScore?.toFixed(1)}</Text>
                    </View>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreItemLabel}>安全</Text>
                        <Text style={styles.scoreItemValue}>{scoringData.safetyScore?.toFixed(1)}</Text>
                    </View>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreItemLabel}>成药</Text>
                        <Text style={styles.scoreItemValue}>{scoringData.druglikenessScore?.toFixed(1)}</Text>
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>权重方法: {scoringData.weightMethod}</Text>
                    <Text style={styles.infoText}>
                        α = {scoringData.alpha}（主客观平衡系数）
                    </Text>
                </View>
                <Text style={styles.adviceText}>{scoringData.expertAdvice}</Text>
            </View>
        );
    };

    // 渲染结合模式分析内容
    const renderInteractionContent = () => {
        if (!interactionData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>相互作用评分</Text>
                    <Text style={[styles.scoreValue, { color: '#2196F3' }]}>
                        {interactionData.interactionScore?.toFixed(1)}
                    </Text>
                </View>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{interactionData.hydrogenBondCount}</Text>
                        <Text style={styles.statLabel}>氢键</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{interactionData.hydrophobicCount}</Text>
                        <Text style={styles.statLabel}>疏水作用</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{interactionData.piPiCount}</Text>
                        <Text style={styles.statLabel}>π-π堆积</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{interactionData.saltBridgeCount}</Text>
                        <Text style={styles.statLabel}>盐桥</Text>
                    </View>
                </View>
                <Text style={styles.sectionTitle}>关键氨基酸残基</Text>
                {interactionData.keyResidues?.slice(0, 5).map((residue, index) => (
                    <View key={index} style={styles.residueItem}>
                        <Text style={styles.residueName}>{residue.residueName}</Text>
                        <Text style={styles.residueType}>{residue.interactionType}</Text>
                    </View>
                ))}
                {interactionData.diagramData && (
                    <InteractionDiagram data={interactionData.diagramData} />
                )}
                <Text style={styles.adviceText}>{interactionData.overallAssessment}</Text>
            </View>
        );
    };

    // 渲染类药性评估内容
    const renderDruglikenessContent = () => {
        if (!druglikenessData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.ruleRow}>
                    <View style={[styles.ruleBadge, druglikenessData.lipinskiViolations === 0 ? styles.passBadge : styles.failBadge]}>
                        <Text style={styles.ruleBadgeText}>
                            Lipinski: {druglikenessData.lipinskiViolations === 0 ? '✅ 通过' : `违反 ${druglikenessData.lipinskiViolations} 条`}
                        </Text>
                    </View>
                    <View style={[styles.ruleBadge, druglikenessData.veberPass ? styles.passBadge : styles.failBadge]}>
                        <Text style={styles.ruleBadgeText}>
                            Veber: {druglikenessData.veberPass ? '✅ 通过' : '❌ 未通过'}
                        </Text>
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>详细检查结果</Text>
                    <Text style={styles.infoText}>分子量: {druglikenessData.mwOk ? '✅ 通过' : '❌ 未通过'}</Text>
                    <Text style={styles.infoText}>LogP: {druglikenessData.logpOk ? '✅ 通过' : '❌ 未通过'}</Text>
                    <Text style={styles.infoText}>氢键供体: {druglikenessData.hbdOk ? '✅ 通过' : '❌ 未通过'}</Text>
                    <Text style={styles.infoText}>氢键受体: {druglikenessData.hbaOk ? '✅ 通过' : '❌ 未通过'}</Text>
                </View>
                <Text style={styles.adviceText}>
                    总体评价: {druglikenessData.overallPass ? '✅ 符合类药性规则' : '⚠️ 不符合类药性规则'}
                </Text>
            </View>
        );
    };

    // 渲染 QSAR 预测内容
    const renderQsarContent = () => {
        if (qsarData === null) return null;
        const kiNm = Math.exp(qsarData / 0.592) * 1e9;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>预测亲和力</Text>
                    <Text style={[styles.scoreValue, { color: '#E91E63' }]}>
                        {qsarData.toFixed(2)} kcal/mol
                    </Text>
                </View>
                <View style={styles.qsarBox}>
                    <View style={styles.qsarRow}>
                        <Text style={styles.qsarLabel}>预测 Ki</Text>
                        <Text style={styles.qsarValue}>{kiNm.toFixed(1)} nM</Text>
                    </View>
                    <View style={styles.qsarRow}>
                        <Text style={styles.qsarLabel}>模型类型</Text>
                        <Text style={styles.qsarValue}>随机森林 (RF)</Text>
                    </View>
                    <View style={styles.qsarRow}>
                        <Text style={styles.qsarLabel}>训练集大小</Text>
                        <Text style={styles.qsarValue}>22 个化合物</Text>
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>模型说明</Text>
                    <Text style={styles.infoText}>
                        该模型基于 22 个天然产物的 Vina 对接结果训练，
                        使用 9 个分子描述符（MW、LogP、HBD、HBA、可旋转键、
                        环数、重原子数、TPSA、FractionCsp3）。
                    </Text>
                    <Text style={[styles.infoText, { marginTop: 8, color: '#999' }]}>
                        ⚠️ 预测值仅供参考，建议与 Vina 对接结果交叉验证。
                    </Text>
                </View>
            </View>
        );
    };

    // 渲染选择性分析内容
    const renderSelectivityContent = () => {
        if (!selectivityData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>选择性评分</Text>
                    <Text style={[styles.scoreValue, { color: '#9C27B0' }]}>
                        {selectivityData.selectivityScore?.toFixed(1)}
                    </Text>
                </View>
                <Text style={styles.selectivityLevel}>
                    等级: {selectivityData.selectivityLevel}
                </Text>
                <Text style={styles.sectionTitle}>CDK家族选择性</Text>
                {selectivityData.kinaseResults?.map((kinase, index) => (
                    <View key={index} style={styles.kinaseItem}>
                        <Text style={styles.kinaseName}>{kinase.kinaseName}</Text>
                        <Text style={styles.kinaseAffinity}>{kinase.affinity?.toFixed(2)} kcal/mol</Text>
                    </View>
                ))}
                <View style={styles.riskBox}>
                    <Text style={styles.riskTitle}>
                        脱靶风险: {selectivityData.offTargetRisk?.riskLevel}
                    </Text>
                    <Text style={styles.riskText}>
                        {selectivityData.offTargetRisk?.recommendation}
                    </Text>
                </View>
            </View>
        );
    };

    // 渲染共识对接内容
    const renderConsensusContent = () => {
        if (!consensusData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>共识评分</Text>
                    <Text style={[styles.scoreValue, { color: '#00BCD4' }]}>
                        {consensusData.consensusScore?.toFixed(1)}
                    </Text>
                </View>
                <View style={styles.consensusInfo}>
                    <Text style={styles.infoText}>
                        共识亲和力: {consensusData.consensusAffinity?.toFixed(2)} kcal/mol
                    </Text>
                    <Text style={styles.infoText}>
                        置信度: {consensusData.confidenceLevel} ({(consensusData.confidence * 100)?.toFixed(0)}%)
                    </Text>
                </View>
                <Text style={styles.sectionTitle}>打分函数结果</Text>
                {consensusData.scoringResults?.map((sf, index) => (
                    <View key={index} style={styles.scoringFunctionItem}>
                        <Text style={styles.sfName}>{sf.functionName}</Text>
                        <Text style={styles.sfAffinity}>{sf.affinity?.toFixed(2)} kcal/mol</Text>
                    </View>
                ))}
                <View style={styles.fpRiskBox}>
                    <Text style={styles.fpRiskTitle}>
                        假阳性风险: {consensusData.falsePositiveRisk?.riskLevel}
                    </Text>
                    <Text style={styles.fpRiskText}>
                        {consensusData.falsePositiveRisk?.recommendation}
                    </Text>
                </View>
            </View>
        );
    };

    // 渲染MD模拟内容
    const renderMdContent = () => {
        if (!mdData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>稳定性评分</Text>
                    <Text style={[styles.scoreValue, { color: '#795548' }]}>
                        {mdData.stabilityScore?.toFixed(1)}
                    </Text>
                </View>
                <Text style={styles.stabilityLevel}>
                    稳定性等级: {mdData.stabilityLevel}
                </Text>
                <View style={styles.mdStats}>
                    <View style={styles.mdStatItem}>
                        <Text style={styles.mdStatValue}>{mdData.rmsdAnalysis?.ligandRmsdAvg?.toFixed(2)} Å</Text>
                        <Text style={styles.mdStatLabel}>配体RMSD</Text>
                    </View>
                    <View style={styles.mdStatItem}>
                        <Text style={styles.mdStatValue}>{mdData.rmsdAnalysis?.proteinRmsdAvg?.toFixed(2)} Å</Text>
                        <Text style={styles.mdStatLabel}>蛋白RMSD</Text>
                    </View>
                    <View style={styles.mdStatItem}>
                        <Text style={styles.mdStatValue}>{mdData.hydrogenBondAnalysis?.avgHydrogenBonds?.toFixed(1)}</Text>
                        <Text style={styles.mdStatLabel}>平均氢键</Text>
                    </View>
                </View>
                <View style={styles.mmpbsaBox}>
                    <Text style={styles.sectionTitle}>MM-PBSA结合自由能</Text>
                    <Text style={styles.mmpbsaValue}>
                        {mdData.mmPbsaResult?.totalBindingEnergy?.toFixed(2)} kcal/mol
                    </Text>
                </View>
                <Text style={styles.adviceText}>{mdData.overallAssessment}</Text>
            </View>
        );
    };

    // 渲染Ensemble对接内容
    const renderEnsembleContent = () => {
        if (!ensembleData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>集成评分</Text>
                    <Text style={[styles.scoreValue, { color: '#607D8B' }]}>
                        {ensembleData.ensembleScore?.toFixed(1)}
                    </Text>
                </View>
                <View style={styles.ensembleInfo}>
                    <Text style={styles.infoText}>
                        构象数量: {ensembleData.conformerCount}
                    </Text>
                    <Text style={styles.infoText}>
                        最佳亲和力: {ensembleData.bestAffinity?.toFixed(2)} kcal/mol
                    </Text>
                    <Text style={styles.infoText}>
                        平均亲和力: {ensembleData.avgAffinity?.toFixed(2)} kcal/mol
                    </Text>
                </View>
                <Text style={styles.sectionTitle}>构象柔性分析</Text>
                <View style={styles.flexibilityBox}>
                    <Text style={styles.flexibilityText}>
                        柔性等级: {ensembleData.flexibilityAnalysis?.flexibilityLevel}
                    </Text>
                    <Text style={styles.flexibilityText}>
                        平均RMSD: {ensembleData.flexibilityAnalysis?.avgRmsd?.toFixed(2)} Å
                    </Text>
                </View>
                <View style={styles.consistencyBox}>
                    <Text style={styles.consistencyTitle}>
                        结合模式一致性: {ensembleData.poseConsistency?.consistencyLevel}
                    </Text>
                    <Text style={styles.consistencyText}>
                        {ensembleData.poseConsistency?.description}
                    </Text>
                </View>
            </View>
        );
    };

    // 渲染GNN预测内容
    const renderGnnContent = () => {
        if (!gnnData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>GNN预测亲和力</Text>
                    <Text style={[styles.scoreValue, { color: '#E91E63' }]}>
                        {gnnData.predictedAffinity?.toFixed(2)} kcal/mol
                    </Text>
                </View>
                <View style={styles.gnnInfo}>
                    <Text style={styles.infoText}>预测Ki: {gnnData.predictedKi?.toFixed(1)} nM</Text>
                    <Text style={styles.infoText}>
                        置信度: {gnnData.predictionLevel} ({(gnnData.confidence * 100)?.toFixed(0)}%)
                    </Text>
                </View>
                <View style={styles.modelBox}>
                    <Text style={styles.sectionTitle}>模型信息</Text>
                    <Text style={styles.modelName}>{gnnData.modelType}</Text>
                    <Text style={styles.modelDesc}>{gnnData.modelDescription}</Text>
                    <Text style={styles.modelStats}>
                        R² = {gnnData.modelR2} | 训练集: {gnnData.trainingSetSize}个化合物
                    </Text>
                </View>
                <View style={styles.uncertaintyBox}>
                    <Text style={styles.uncertaintyTitle}>不确定性估计</Text>
                    <Text style={styles.uncertaintyText}>
                        95%置信区间: [{gnnData.uncertainty?.lowerBound?.toFixed(2)}, {gnnData.uncertainty?.upperBound?.toFixed(2)}] kcal/mol
                    </Text>
                </View>
            </View>
        );
    };

    // 渲染AI分子生成内容
    const renderGenerationContent = () => {
        if (!generationData) return null;
        return (
            <View style={styles.contentContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>生成/筛选</Text>
                    <Text style={[styles.scoreValue, { color: '#FF5722', fontSize: 22 }]}>
                        {generationData.filteredCount}/{generationData.generatedCount}
                    </Text>
                </View>
                <View style={styles.ensembleInfo}>
                    <Text style={styles.infoText}>目标蛋白: {generationData.targetProtein}</Text>
                    <Text style={styles.infoText}>方法: {generationData.generationMethod}</Text>
                    <Text style={styles.infoText}>
                        最佳亲和力: {generationData.statistics?.bestAffinity?.toFixed(2)} kcal/mol
                    </Text>
                </View>
                <Text style={styles.sectionTitle}>Top 生成分子</Text>
                {generationData.molecules?.slice(0, 5).map((mol) => (
                    <View key={mol.id} style={styles.kinaseItem}>
                        <Text style={styles.kinaseName}>#{mol.rank} {mol.name}</Text>
                        <Text style={styles.kinaseAffinity}>{mol.predictedAffinity?.toFixed(2)} kcal/mol</Text>
                    </View>
                ))}
                <Text style={styles.adviceText}>{generationData.overallAssessment}</Text>
            </View>
        );
    };

    // 渲染模块内容
    const renderModuleContent = (moduleId: string) => {
        switch (moduleId) {
            case 'scoring': return renderScoringContent();
            case 'interaction': return renderInteractionContent();
            case 'druglikeness': return renderDruglikenessContent();
            case 'qsar': return renderQsarContent();
            case 'selectivity': return renderSelectivityContent();
            case 'consensus': return renderConsensusContent();
            case 'md': return renderMdContent();
            case 'ensemble': return renderEnsembleContent();
            case 'gnn': return renderGnnContent();
            case 'generation': return renderGenerationContent();
            default: return null;
        }
    };

    // 检查模块是否已加载数据
    const hasData = (moduleId: string) => {
        switch (moduleId) {
            case 'scoring': return !!scoringData;
            case 'interaction': return !!interactionData;
            case 'druglikeness': return !!druglikenessData;
            case 'qsar': return qsarData !== null;
            case 'selectivity': return !!selectivityData;
            case 'consensus': return !!consensusData;
            case 'md': return !!mdData;
            case 'ensemble': return !!ensembleData;
            case 'gnn': return !!gnnData;
            case 'generation': return !!generationData;
            default: return false;
        }
    };

    return (
        <View style={styles.container}>
            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>高级分析</Text>
                <View style={styles.headerRight} />
            </View>

            {/* 化合物信息 */}
            <View style={styles.compoundInfo}>
                <Text style={styles.compoundName}>{compoundName}</Text>
                <Text style={styles.compoundSubtitle}>10大分析模块</Text>
            </View>

            {/* 功能模块列表 */}
            <ScrollView style={styles.modulesList}>
                {MODULES.map((module) => (
                    <View key={module.id} style={styles.moduleCard}>
                        <TouchableOpacity
                            style={styles.moduleHeader}
                            onPress={() => {
                                if (hasData(module.id)) {
                                    toggleExpand(module.id);
                                } else {
                                    loadModuleData(module.id);
                                }
                            }}
                        >
                            <View style={[styles.moduleIcon, { backgroundColor: module.color + '20' }]}>
                                <MaterialCommunityIcons
                                    name={module.icon as any}
                                    size={24}
                                    color={module.color}
                                />
                            </View>
                            <View style={styles.moduleInfo}>
                                <View style={styles.moduleTitleRow}>
                                    <Text style={styles.moduleName}>{module.name}</Text>
                                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(module.priority) }]}>
                                        <Text style={styles.priorityText}>{module.priority}</Text>
                                    </View>
                                </View>
                                <Text style={styles.moduleDescription}>{module.description}</Text>
                            </View>
                            {loadingStates[module.id] ? (
                                <ActivityIndicator size="small" color={module.color} />
                            ) : (
                                <Ionicons
                                    name={expandedModules[module.id] ? 'chevron-up' : 'chevron-forward'}
                                    size={20}
                                    color="#999"
                                />
                            )}
                        </TouchableOpacity>

                        {expandedModules[module.id] && renderModuleContent(module.id)}
                    </View>
                ))}
                {/* 底部间距 */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerRight: {
        width: 34,
    },
    compoundInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    compoundName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    compoundSubtitle: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
    modulesList: {
        flex: 1,
        padding: 15,
    },
    moduleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        ...theme.shadows.card,
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    moduleIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    moduleName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        marginRight: 8,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '500',
    },
    moduleDescription: {
        fontSize: 12,
        color: '#999',
    },
    contentContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fafafa',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    scoreLabel: {
        fontSize: 14,
        color: '#666',
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    threeScores: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    scoreItem: {
        alignItems: 'center',
    },
    scoreItemLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    scoreItemValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    infoBox: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
    },
    adviceText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
        marginTop: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    statItem: {
        width: '25%',
        alignItems: 'center',
        padding: 10,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 10,
        marginTop: 5,
    },
    residueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    residueName: {
        fontSize: 13,
        color: theme.colors.text,
        fontWeight: '500',
    },
    residueType: {
        fontSize: 12,
        color: '#999',
    },
    ruleRow: {
        flexDirection: 'row',
        marginBottom: 15,
        flexWrap: 'wrap',
    },
    ruleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: 10,
        marginBottom: 8,
    },
    passBadge: {
        backgroundColor: '#E8F5E9',
    },
    failBadge: {
        backgroundColor: '#FFEBEE',
    },
    ruleBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    qsarBox: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    qsarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    qsarLabel: {
        fontSize: 13,
        color: '#666',
    },
    qsarValue: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text,
    },
    selectivityLevel: {
        fontSize: 14,
        color: '#9C27B0',
        fontWeight: '600',
        marginBottom: 15,
    },
    kinaseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    kinaseName: {
        fontSize: 13,
        color: theme.colors.text,
        fontWeight: '500',
    },
    kinaseAffinity: {
        fontSize: 13,
        color: '#666',
    },
    riskBox: {
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    riskTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#E65100',
        marginBottom: 6,
    },
    riskText: {
        fontSize: 12,
        color: '#E65100',
        lineHeight: 18,
    },
    consensusInfo: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    scoringFunctionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sfName: {
        fontSize: 13,
        color: theme.colors.text,
        fontWeight: '500',
    },
    sfAffinity: {
        fontSize: 13,
        color: '#666',
    },
    fpRiskBox: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    fpRiskTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1565C0',
        marginBottom: 6,
    },
    fpRiskText: {
        fontSize: 12,
        color: '#1565C0',
        lineHeight: 18,
    },
    stabilityLevel: {
        fontSize: 14,
        color: '#795548',
        fontWeight: '600',
        marginBottom: 15,
    },
    mdStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    mdStatItem: {
        alignItems: 'center',
    },
    mdStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    mdStatLabel: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    mmpbsaBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    mmpbsaValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#795548',
        marginTop: 8,
    },
    ensembleInfo: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    flexibilityBox: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    flexibilityText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    consistencyBox: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    consistencyTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 6,
    },
    consistencyText: {
        fontSize: 12,
        color: '#2E7D32',
        lineHeight: 18,
    },
    gnnInfo: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    modelBox: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    modelName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E91E63',
        marginBottom: 6,
    },
    modelDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        marginBottom: 8,
    },
    modelStats: {
        fontSize: 11,
        color: '#999',
    },
    uncertaintyBox: {
        backgroundColor: '#FCE4EC',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    uncertaintyTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#C2185B',
        marginBottom: 6,
    },
    uncertaintyText: {
        fontSize: 12,
        color: '#C2185B',
    },
});