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
import { compoundAPI } from '../services/api';

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

    useEffect(() => {
        fetchAnalysis();
    }, [compoundId]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await compoundAPI.calculateScore(compoundId);
            setResult(data);
            
            // 启动进度条动画
            Animated.timing(progressAnim, {
                toValue: data.totalScore,
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

    // --- 熔断状态展示 ---
    if (result.isVetoed) {
        return (
            <View style={[styles.container, { backgroundColor: '#FFEBEE' }]}>
                <View style={styles.navBarVeto}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.navTitleContainer}>
                        <Text style={styles.navTitle}>分析报告 (已终止)</Text>
                        <Text style={styles.navSubtitle}>{compoundName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.vetoContainer}>
                    <MaterialCommunityIcons name="alert-octagon" size={100} color="#D32F2F" />
                    <Text style={styles.vetoTitle}>⛔ 触发安全熔断</Text>
                    <Text style={styles.vetoScore}>0</Text>
                    <Text style={styles.vetoSubtitle}>该分子存在严重安全性风险</Text>

                    {/* 熔断标签 */}
                    <View style={styles.vetoTagsContainer}>
                        {result.adviceTags.map((tag, index) => (
                            <View key={index} style={styles.vetoTag}>
                                <Text style={styles.vetoTagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 专家警告卡片 */}
                    <View style={styles.vetoCard}>
                        <View style={styles.vetoCardHeader}>
                            <MaterialCommunityIcons name="shield-alert" size={24} color="#D32F2F" />
                            <Text style={styles.vetoCardTitle}>专家警告</Text>
                        </View>
                        <Text style={styles.vetoAdviceText}>{result.expertAdvice}</Text>
                    </View>

                    {/* 返回按钮 */}
                    <TouchableOpacity 
                        style={styles.vetoBackButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.vetoBackButtonText}>返回化合物列表</Text>
                    </TouchableOpacity>
                </ScrollView>
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
                        label="安全" 
                        sublabel="35%" 
                        value={result.safetyScore} 
                        max={35} 
                        color="#388E3C" 
                        icon="shield-check"
                    />
                    <StatBox 
                        label="成药" 
                        sublabel="20%" 
                        value={result.druglikenessScore} 
                        max={20} 
                        color="#FBC02D" 
                        icon="pill"
                    />
                </View>

                {/* 3. 智能标签 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="tag-multiple" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>智能标签</Text>
                    </View>
                    <View style={styles.tagsContainer}>
                        {result.adviceTags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 4. AI 决策建议 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="brain" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>AI 决策建议</Text>
                    </View>
                    <View style={styles.adviceCard}>
                        <Text style={styles.adviceText}>{result.expertAdvice}</Text>
                    </View>
                </View>

                {/* 5. 报告信息 */}
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

                {/* 6. 导出按钮 */}
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
