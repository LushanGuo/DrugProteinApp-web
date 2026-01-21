// src/screens/DetailScreen.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import UnityView from '@azesmway/react-native-unity';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;

interface Props {
    route: DetailScreenRouteProp;
    navigation: DetailScreenNavigationProp;
}

export default function DetailScreen({ route, navigation }: Props) {
    const { compound } = route.params;
    const unityRef = useRef<any>(null);

    const handleDocking = () => {
        Alert.alert("开始对接", `正在将 ${compound.name} 发送至 Vina 引擎...`, [{ text: "确定" }]);
        // 这里后续将调用 POST /api/docking/start
    };

    // Unity 消息处理
    const handleUnityMessage = (message: string) => {
        console.log('Unity 消息:', message);
        // 可以在这里处理 Unity 发来的消息
    };

    // 发送消息到 Unity
    const sendToUnity = (gameObject: string, method: string, message: string) => {
        if (unityRef.current) {
            unityRef.current.postMessage(gameObject, method, message);
        }
    };

    return (
        <View style={styles.container}>
            {/* 1. 自定义导航栏 */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{compound.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. 3D 可视化区域 (Unity) */}
                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Text style={styles.sectionTitle}>3D 蛋白质-配体复合物</Text>
                        <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={() => sendToUnity('GameManager', 'ResetCamera', '')}
                        >
                            <MaterialCommunityIcons name="refresh" size={18} color={theme.colors.primary} />
                            <Text style={styles.controlText}>重置视角</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.unityContainer}>
                        <UnityView
                            ref={unityRef}
                            style={styles.unityView}
                            onUnityMessage={handleUnityMessage}
                        />
                    </View>
                    <View style={styles.unityHint}>
                        <MaterialCommunityIcons name="gesture-swipe" size={16} color={theme.colors.text.light} />
                        <Text style={styles.hintText}>拖动旋转 · 双指缩放 · 查看蛋白质拼接效果</Text>
                    </View>
                </View>

                {/* 3. 基础信息 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>基础理化性质</Text>
                    <View style={styles.infoGrid}>
                        <InfoItem label="英文名" value={compound.englishName} />
                        <InfoItem label="分子量" value={`${compound.molecularWeight} g/mol`} />
                        <InfoItem label="LogP" value={compound.logP.toString()} />
                        <InfoItem label="分类" value={compound.category} />
                    </View>
                    <View style={styles.smilesBox}>
                        <Text style={styles.smilesLabel}>SMILES:</Text>
                        <Text style={styles.smilesText}>{compound.smiles}</Text>
                    </View>
                </View>

                {/* 4. ADMET 预测 (雷达图占位) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ADMET 毒性预测</Text>
                    <View style={styles.chartPlaceholder}>
                        <MaterialCommunityIcons name="radar" size={48} color="#FFA726" />
                        <Text style={styles.placeholderText}>雷达图展示区域</Text>
                        <Text style={styles.subText}>将在对接完成后生成五维数据</Text>
                    </View>
                </View>

                {/* 5. 对接操作栏 */}
                <TouchableOpacity style={styles.dockingButton} onPress={handleDocking} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="dna" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>开始 Vina 分子对接</Text>
                </TouchableOpacity>

                {/* 6. 查看综合分析报告按钮 */}
                <TouchableOpacity
                    style={[styles.dockingButton, { backgroundColor: theme.colors.secondary, marginTop: 10 }]}
                    onPress={() => navigation.navigate('Report', { compoundId: compound.id, compoundName: compound.name })}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="file-document-outline" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>查看综合分析报告</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    navBar: {
        height: 90, paddingTop: 40, paddingHorizontal: 16,
        backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    backButton: { padding: 4 },
    navTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 16, paddingBottom: 40 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: theme.colors.primary, paddingLeft: 8 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    controlButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, ...theme.shadows.soft },
    controlText: { fontSize: 12, color: theme.colors.primary, marginLeft: 4, fontWeight: '600' },
    unityContainer: {
        height: 300,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        ...theme.shadows.strong
    },
    unityView: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    unityHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 6
    },
    hintText: {
        fontSize: 12,
        color: theme.colors.text.light,
        fontStyle: 'italic'
    },
    chartPlaceholder: {
        height: 180, backgroundColor: '#FFF3E0', borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#FFE0B2'
    },
    placeholderText: { marginTop: 8, fontSize: 14, fontWeight: 'bold', color: theme.colors.text.secondary },
    subText: { fontSize: 12, color: theme.colors.text.light },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'white', padding: 16, borderRadius: 12, ...theme.shadows.card },
    infoItem: { width: '50%', marginBottom: 16 },
    infoLabel: { fontSize: 12, color: theme.colors.text.light },
    infoValue: { fontSize: 14, color: theme.colors.text.primary, fontWeight: '500', marginTop: 2 },
    smilesBox: { marginTop: 12, backgroundColor: '#ECEFF1', padding: 12, borderRadius: 8 },
    smilesLabel: { fontSize: 10, fontWeight: 'bold', color: theme.colors.text.secondary },
    smilesText: { fontSize: 12, color: theme.colors.text.primary, fontFamily: 'monospace', marginTop: 4 },
    dockingButton: {
        backgroundColor: theme.colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 16, borderRadius: 30, ...theme.shadows.strong, marginTop: 10
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});