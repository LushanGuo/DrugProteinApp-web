// src/screens/ReportScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ScoringResult } from '../types';
import { theme } from '../theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { analysisAPI, admetAPI } from '../services/api';
import { AdmetResult } from '../types/api';
import { 
    getRadarData, 
    getHergRiskLevel, 
    getAmesDescription, 
    getLiverToxicityDescription,
    getAbsorptionDescription,
    getMetabolismDescription,
    getAdmetOverallAssessment 
} from '../utils/admetUtils';

type ReportScreenRouteProp = RouteProp<RootStackParamList, 'Report'>;
type ReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Report'>;

interface Props {
    route: ReportScreenRouteProp;
    navigation: ReportScreenNavigationProp;
}

export default function ReportScreen({ route, navigation }: Props) {
    const { compoundId, compoundName } = route.params;
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<ScoringResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progressAnim] = useState(new Animated.Value(0));
    
    // ADMET 预测状态
    const [admetLoading, setAdmetLoading] = useState(false);
    const [admetResult, setAdmetResult] = useState<AdmetResult | null>(null);

    useEffect(() => {
        fetchAnalysis();
        fetchAdmetResult(); // 尝试获取已有的ADMET结果
    }, [compoundId]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await analysisAPI.calculateScore(compoundId);
            setResult(response.data);
            
            // 启动进度条动画
            Animated.timing(progressAnim, {
                toValue: response.data.totalScore,
                duration: 1500,
                useNativeDriver: false,
            }).start();
        } catch (err: any) {
            console.error('分析计算失败:', err);
            setError(err.message || '分析计算失败');
            Alert.alert('错误', '无法获取分析结果，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 获取已有的ADMET结果
    const fetchAdmetResult = async () => {
        try {
            const response = await admetAPI.getResultByCompoundId(compoundId);
            if (response.success && response.data) {
                setAdmetResult(response.data);
            }
        } catch (error) {
            console.log('暂无ADMET预测结果');
        }
    };

    // 执行ADMET预测
    const handleAdmetPredict = async () => {
        try {
            setAdmetLoading(true);
            const response = await admetAPI.predict(compoundId);
            
            if (response.success && response.data) {
                setAdmetResult(response.data);
                Alert.alert('预测完成', 'ADMET毒性预测已完成');
            } else {
                Alert.alert('预测失败', response.message || '无法完成ADMET预测');
            }
        } catch (error: any) {
            console.error('ADMET预测失败:', error);
            Alert.alert('错误', error.response?.data?.message || 'ADMET预测失败');
        } finally {
            setAdmetLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#4CAF50';
        if (score >= 60) return '#FFA726';
        return '#EF5350';
    };

    // 加载状态
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>分析报告</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>正在执行多维评分算法...</Text>
                    <Text style={styles.loadingSubtext}>分析效能、安全性、成药性...</Text>
                </View>
            </View>
        );
    }

    // 错误状态
    if (error || !result) {
        return (
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>分析报告</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF5350" />
                    <Text style={styles.errorText}>{error || '无法加载数据'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchAnalysis}>
                        <Text style={styles.retryButtonText}>重试</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // --- 正常评分展示 ---
    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.navTitleContainer}>
                    <Text style={styles.navTitle}>综合分析报告</Text>
                    <Text style={styles.navSubtitle}>{compoundName}</Text>
                </View>
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* 1. 核心仪表盘 - 圆形进度条 */}
                <View style={styles.scoreContainer}>
                    <CircularProgress 
                        score={result.totalScore} 
                        color={getScoreColor(result.totalScore)} 
                    />
                </View>

                {/* 2. 三大模块得分详情 */}
                <View style={styles.statsRow}>
                    <StatBox 
                        label="效能" 
                        sublabel="45%" 
                        value={result.potencyScore} 
                        max={45} 
                        color="#1976D2" 
                        icon="flash"
                    />
                    <StatBox 
                        label="安全性" 
                        sublabel="35%" 
                        value={result.safetyScore} 
                        max={35} 
                        color="#388E3C" 
                        icon="shield-check"
                    />
                    <StatBox 
                        label="类药性" 
                        sublabel="20%" 
                        value={result.druglikenessScore} 
                        max={20} 
                        color="#FBC02D" 
                        icon="pill"
                    />
                </View>

                {/* 3. 优点标签 */}
                {result.adviceTags && result.adviceTags.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                            <Text style={styles.sectionTitle}>优势特征</Text>
                        </View>
                        <View style={styles.tagsContainer}>
                            {result.adviceTags.map((tag, index) => (
                                <View key={index} style={styles.goodTag}>
                                    <Text style={styles.goodTagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 4. 缺点标签 - 如果被一票否决则显示 */}
                {result.vetoed && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="alert-circle" size={24} color="#FF9800" />
                            <Text style={styles.sectionTitle}>需要关注</Text>
                        </View>
                        <View style={styles.tagsContainer}>
                            <View style={styles.badTag}>
                                <Text style={styles.badTagText}>一票否决</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 4.5. ADMET 毒性预测 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="flask" size={24} color="#FF6F00" />
                        <Text style={styles.sectionTitle}>ADMET 毒性预测</Text>
                    </View>
                    
                    {!admetResult ? (
                        <View style={styles.admetPlaceholder}>
                            <MaterialCommunityIcons name="test-tube" size={48} color="#FFA726" />
                            <Text style={styles.placeholderText}>尚未进行 ADMET 预测</Text>
                            <TouchableOpacity 
                                style={styles.predictButton} 
                                onPress={handleAdmetPredict}
                                disabled={admetLoading}
                                activeOpacity={0.8}
                            >
                                {admetLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="play" size={18} color="white" style={{ marginRight: 6 }} />
                                        <Text style={styles.predictButtonText}>开始预测</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.admetCard}>
                            {/* ADMET 综合评价 */}
                            {(() => {
                                const assessment = getAdmetOverallAssessment(admetResult);
                                return (
                                    <View style={[styles.assessmentBanner, { backgroundColor: assessment.color + '20', borderColor: assessment.color }]}>
                                        <Text style={[styles.assessmentGrade, { color: assessment.color }]}>
                                            {assessment.grade}
                                        </Text>
                                        <Text style={styles.assessmentScore}>
                                            综合安全性评分: {assessment.score.toFixed(1)}
                                        </Text>
                                        <Text style={styles.assessmentRecommendation}>
                                            {assessment.recommendation}
                                        </Text>
                                    </View>
                                );
                            })()}
                            
                            {/* ADMET 指标详情 */}
                            <View style={styles.admetMetrics}>
                                {(() => {
                                    const hergRisk = getHergRiskLevel(admetResult.hergToxicity);
                                    return (
                                        <AdmetMetric 
                                            label="心脏安全性" 
                                            value={(1 - admetResult.hergToxicity) * 100}
                                            unit="%"
                                            icon="heart-pulse"
                                            color={hergRisk.color}
                                            description={`${hergRisk.level} - ${hergRisk.description}`}
                                        />
                                    );
                                })()}
                                
                                {(() => {
                                    const amesDesc = getAmesDescription(admetResult.amesToxicity);
                                    return (
                                        <AdmetMetric 
                                            label="致突变性" 
                                            value={admetResult.amesToxicity === 0 ? 100 : 0}
                                            unit=""
                                            icon="dna"
                                            color={amesDesc.color}
                                            description={`Ames ${amesDesc.status} - ${amesDesc.description}`}
                                        />
                                    );
                                })()}
                                
                                {(() => {
                                    const liverDesc = getLiverToxicityDescription(admetResult.liverToxicity);
                                    return (
                                        <AdmetMetric 
                                            label="肝脏安全性" 
                                            value={admetResult.liverToxicity === 0 ? 100 : 0}
                                            unit=""
                                            icon="water"
                                            color={liverDesc.color}
                                            description={`${liverDesc.status} - ${liverDesc.description}`}
                                        />
                                    );
                                })()}
                                
                                {(() => {
                                    const absorptionDesc = getAbsorptionDescription(admetResult.absorption);
                                    const absorptionValue = admetResult.absorption !== null && admetResult.absorption !== undefined
                                        ? admetResult.absorption * 100
                                        : 80;
                                    return (
                                        <AdmetMetric 
                                            label="吸收性" 
                                            value={absorptionValue}
                                            unit="%"
                                            icon="arrow-up-bold"
                                            color={absorptionDesc.color}
                                            description={`${absorptionDesc.level} - ${absorptionDesc.description}`}
                                        />
                                    );
                                })()}
                                
                                {(() => {
                                    const metabolismDesc = getMetabolismDescription(admetResult.metabolism);
                                    const metabolismValue = admetResult.metabolism !== null && admetResult.metabolism !== undefined
                                        ? admetResult.metabolism * 100
                                        : 75;
                                    return (
                                        <AdmetMetric 
                                            label="代谢稳定性" 
                                            value={metabolismValue}
                                            unit="%"
                                            icon="chart-line"
                                            color={metabolismDesc.color}
                                            description={`${metabolismDesc.level} - ${metabolismDesc.description}`}
                                        />
                                    );
                                })()}
                            </View>
                            
                            <Text style={styles.admetTimestamp}>
                                预测时间: {new Date(admetResult.updatedAt).toLocaleString('zh-CN')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 5. AI 决策建议 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="brain" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>专家建议</Text>
                    </View>
                    <View style={styles.adviceCard}>
                        <Text style={styles.adviceText}>{result.expertAdvice}</Text>
                    </View>
                </View>

                {/* 6. 报告信息 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>报告信息</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <InfoRow label="化合物ID" value={compoundId.toString()} />
                        <InfoRow label="化合物名称" value={compoundName} />
                        <InfoRow label="生成时间" value={new Date().toLocaleString('zh-CN')} />
                    </View>
                </View>

                {/* 7. 导出按钮 */}
                <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="download" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.exportButtonText}>导出 PDF 报告</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// 圆形进度条组件
const CircularProgress = ({ score, color }: { score: number; color: string }) => {
    const size = 180;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    return (
        <View style={styles.circularProgress}>
            <View style={styles.circularProgressInner}>
                <Text style={[styles.scoreText, { color }]}>{Math.round(score)}</Text>
                <Text style={styles.scoreLabel}>综合评分</Text>
            </View>
            {/* 简化版圆形进度 - 使用背景色模拟 */}
            <View 
                style={[
                    styles.progressRing, 
                    { 
                        borderColor: color,
                        borderWidth: strokeWidth,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    }
                ]} 
            />
        </View>
    );
};

// 维度得分盒子组件
const StatBox = ({ 
    label, 
    sublabel, 
    value, 
    max, 
    color, 
    icon 
}: { 
    label: string; 
    sublabel: string; 
    value: number; 
    max: number; 
    color: string; 
    icon: string;
}) => (
    <View style={[styles.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        <Text style={[styles.statValue, { color }]}>{value.toFixed(1)}</Text>
        <Text style={styles.statMax}>/ {max}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statSublabel}>{sublabel}</Text>
    </View>
);

// 信息行组件
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

// ADMET 指标组件
const AdmetMetric = ({ 
    label, 
    value, 
    unit, 
    icon, 
    color, 
    description 
}: { 
    label: string; 
    value: number; 
    unit: string; 
    icon: string; 
    color: string; 
    description: string;
}) => (
    <View style={styles.admetMetricBox}>
        <View style={styles.admetMetricHeader}>
            <MaterialCommunityIcons name={icon as any} size={24} color={color} />
            <Text style={styles.admetMetricLabel}>{label}</Text>
        </View>
        <Text style={[styles.admetMetricValue, { color }]}>
            {value.toFixed(0)}{unit}
        </Text>
        <Text style={styles.admetMetricDesc}>{description}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    navBar: {
        height: 90,
        paddingTop: 40,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navBarVeto: {
        height: 90,
        paddingTop: 40,
        paddingHorizontal: 16,
        backgroundColor: '#D32F2F',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    navTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    navTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    navSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    shareButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: theme.colors.text.light,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    scoreContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    circularProgress: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circularProgressInner: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 1,
    },
    progressRing: {
        backgroundColor: 'transparent',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'white',
        marginHorizontal: 4,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        ...theme.shadows.card,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statMax: {
        fontSize: 12,
        color: theme.colors.text.light,
    },
    statLabel: {
        fontSize: 13,
        color: theme.colors.text.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    statSublabel: {
        fontSize: 11,
        color: theme.colors.text.light,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    goodTag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#81C784',
    },
    goodTagText: {
        fontSize: 13,
        color: '#2E7D32',
        fontWeight: '500',
    },
    badTag: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    badTagText: {
        fontSize: 13,
        color: '#E65100',
        fontWeight: '500',
    },
    tag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },
    tagText: {
        fontSize: 13,
        color: '#1565C0',
        fontWeight: '500',
    },
    adviceCard: {
        backgroundColor: '#FFF3E0',
        borderRadius: theme.borderRadius.l,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    adviceText: {
        fontSize: 15,
        color: theme.colors.text.primary,
        lineHeight: 24,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.l,
        padding: 16,
        ...theme.shadows.card,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    exportButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 30,
        marginTop: 16,
        ...theme.shadows.strong,
    },
    exportButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // ADMET 预测样式
    admetPlaceholder: {
        backgroundColor: '#FFF3E0',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#FFE0B2',
    },
    placeholderText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.secondary,
    },
    predictButton: {
        backgroundColor: '#FF6F00',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 16,
    },
    predictButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    admetCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        ...theme.shadows.card,
    },
    assessmentBanner: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 2,
        alignItems: 'center',
    },
    assessmentGrade: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    assessmentScore: {
        fontSize: 16,
        color: theme.colors.text.primary,
        marginBottom: 8,
        fontWeight: '600',
    },
    assessmentRecommendation: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    radarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    radarTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    radarPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    radarSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: theme.colors.text.light,
    },
    radarHint: {
        marginTop: 12,
        fontSize: 10,
        color: theme.colors.text.light,
        textAlign: 'center',
        lineHeight: 16,
    },
    admetMetrics: {
        marginTop: 16,
    },
    admetMetricBox: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    admetMetricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    admetMetricLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    admetMetricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    admetMetricDesc: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    admetTimestamp: {
        fontSize: 11,
        color: theme.colors.text.light,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
    // 熔断样式
    vetoContainer: {
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    vetoTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginTop: 20,
    },
    vetoScore: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginVertical: 10,
    },
    vetoSubtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    vetoTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    vetoTag: {
        backgroundColor: '#FFCDD2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginHorizontal: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EF5350',
    },
    vetoTagText: {
        fontSize: 13,
        color: '#C62828',
        fontWeight: '600',
    },
    vetoCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        ...theme.shadows.card,
    },
    vetoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    vetoCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginLeft: 8,
    },
    vetoAdviceText: {
        fontSize: 15,
        color: theme.colors.text.primary,
        lineHeight: 24,
    },
    vetoBackButton: {
        backgroundColor: '#757575',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 10,
    },
    vetoBackButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
