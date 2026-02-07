import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls } from '@react-three/drei/native';
import { CartoonProtein } from '../components/3d/CartoonProtein';
import { StickLigand } from '../components/3d/StickLigand';
import { DockingAnimation } from '../components/3d/DockingAnimation';
import { ARParallax } from '../components/3d/ARParallax';
import { RadarChart } from '../components/RadarChart';
import { compoundAPI, visualAPI, dockingAPI, admetAPI } from '../services/api';
import { AdmetResult } from '../types/api';
import { 
    getRadarData, 
    getAdmetOverallAssessment 
} from '../utils/admetUtils';
import { DeviceMotion } from 'expo-sensors';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;

interface Props {
    route: DetailScreenRouteProp;
    navigation: DetailScreenNavigationProp;
}

export default function DetailScreen({ route, navigation }: Props) {
    const { compound } = route.params;
    
    // 3D 分子数据状态
    const [receptor, setReceptor] = useState<string | null>(null);
    const [ligand, setLigand] = useState<string | null>(null);
    const [loading3D, setLoading3D] = useState(true);
    
    // 对接状态
    const [docking, setDocking] = useState(false);
    const [dockingStatus, setDockingStatus] = useState<string>('');
    const [dockingResult, setDockingResult] = useState<any>(null);
    
    // ADMET 预测状态
    const [admetLoading, setAdmetLoading] = useState(false);
    const [admetResult, setAdmetResult] = useState<AdmetResult | null>(null);
    
    // 对接动画状态
    const [isDockingAnimating, setIsDockingAnimating] = useState(false);
    const ligandGroupRef = useRef<any>(null);
    
    // 全屏3D查看器状态
    const [fullscreen3D, setFullscreen3D] = useState(false);
    
    // AR模式状态
    const [arMode, setArMode] = useState(false);
    const [arAvailable, setArAvailable] = useState(false);
    const [arDebugInfo, setArDebugInfo] = useState('');
    const [arAngles, setArAngles] = useState({ beta: 0, gamma: 0 });
    const sceneGroupRef = useRef<any>(null);
    
    // 检查AR传感器可用性
    useEffect(() => {
        const checkARAvailability = async () => {
            try {
                const available = await DeviceMotion.isAvailableAsync();
                setArAvailable(available);
                
                if (available) {
                    console.log('✅ AR传感器可用');
                    setArDebugInfo('AR传感器已就绪');
                } else {
                    console.log('❌ AR传感器不可用');
                    setArDebugInfo('设备不支持运动传感器');
                }
            } catch (error) {
                console.error('检查AR可用性失败:', error);
                setArDebugInfo('传感器检查失败');
            }
        };
        
        checkARAvailability();
    }, []);
    
    // 监听设备运动，更新角度显示
    useEffect(() => {
        if (!arMode || !arAvailable) return;
        
        DeviceMotion.setUpdateInterval(100); // 每100ms更新一次显示
        
        const subscription = DeviceMotion.addListener((data) => {
            if (data.rotation) {
                setArAngles({
                    beta: data.rotation.beta || 0,
                    gamma: data.rotation.gamma || 0,
                });
            }
        });
        
        return () => {
            subscription.remove();
        };
    }, [arMode, arAvailable]);

    // 加载 3D 分子数据
    useEffect(() => {
        const fetchStructureData = async () => {
            try {
                setLoading3D(true);
                console.log(`正在加载化合物 ${compound.id} 的 3D 结构数据...`);
                
                // 优先使用新的 3D 可视化接口（包含对接后的配体）
                try {
                    const response = await visualAPI.get3DData(compound.id);
                    const data = response.data;
                    
                    console.log(`成功加载 3D 可视化数据`);
                    console.log(`蛋白质 PDB 长度: ${data.proteinPdb?.length || 0} 字符`);
                    console.log(`对接后配体 PDBQT 长度: ${data.dockedLigandPdbqt?.length || 0} 字符`);
                    console.log(`结合能: ${data.bindingEnergy} kcal/mol`);
                    
                    // 验证数据是否有效（需要足够的数据才能渲染）
                    const hasValidProtein = data.proteinPdb && data.proteinPdb.length > 100;
                    const hasValidLigand = data.dockedLigandPdbqt && data.dockedLigandPdbqt.length > 50;
                    
                    if (hasValidProtein) {
                        setReceptor(data.proteinPdb);
                    } else {
                        console.warn('蛋白质 PDB 数据不完整（长度: ' + (data.proteinPdb?.length || 0) + '），需要至少 100 字符');
                    }
                    
                    if (hasValidLigand) {
                        setLigand(data.dockedLigandPdbqt);
                    } else {
                        console.warn('配体 PDBQT 数据不完整（长度: ' + (data.dockedLigandPdbqt?.length || 0) + '），需要至少 50 字符');
                        // 如果对接后的配体为空，尝试使用备用方案
                        throw new Error('Docked ligand data is incomplete');
                    }
                } catch (visualError) {
                    console.log('3D 可视化接口失败或数据不完整，尝试使用备用方案...');
                    console.log('错误详情:', visualError);
                    
                    // 备用方案1: 如果详情接口已经包含 3D 数据，直接使用
                    const hasValidCompoundProtein = compound.receptorPdb && compound.receptorPdb.length > 100;
                    const hasValidCompoundLigand = compound.ligandPdbqt && compound.ligandPdbqt.length > 50;
                    
                    if (hasValidCompoundProtein && hasValidCompoundLigand) {
                        console.log(`使用详情接口中的 3D 数据`);
                        console.log(`受体 PDB 长度: ${compound.receptorPdb!.length} 字符`);
                        console.log(`配体 PDBQT 长度: ${compound.ligandPdbqt!.length} 字符`);
                        setReceptor(compound.receptorPdb!);
                        setLigand(compound.ligandPdbqt!);
                    } else {
                        // 备用方案2: 使用结构数据接口
                        console.log(`使用结构数据接口获取...`);
                        const response = await compoundAPI.getStructure(compound.id);
                        const data = response.data;
                        
                        console.log(`结构数据接口返回:`);
                        console.log(`受体 PDB 长度: ${data.receptorPdb?.length || 0} 字符`);
                        console.log(`配体 PDBQT 长度: ${data.ligandPdbqt?.length || 0} 字符`);
                        
                        // 验证数据完整性
                        const hasValidStructureProtein = data.receptorPdb && data.receptorPdb.length > 100;
                        const hasValidStructureLigand = data.ligandPdbqt && data.ligandPdbqt.length > 50;
                        
                        if (hasValidStructureProtein) {
                            setReceptor(data.receptorPdb);
                        } else {
                            console.warn('结构数据接口返回的蛋白质数据不完整');
                        }
                        
                        if (hasValidStructureLigand) {
                            setLigand(data.ligandPdbqt);
                        } else {
                            console.warn('结构数据接口返回的配体数据不完整');
                        }
                    }
                }
            } catch (error) {
                console.error('加载 3D 结构数据失败:', error);
                Alert.alert(
                    '加载失败', 
                    '无法加载 3D 结构数据，请检查网络连接或稍后重试',
                    [{ text: '确定' }]
                );
                setReceptor(null);
                setLigand(null);
            } finally {
                setLoading3D(false);
            }
        };
        
        fetchStructureData();
    }, [compound.id, compound.receptorPdb, compound.ligandPdbqt]);

    // 加载 ADMET 数据
    useEffect(() => {
        fetchAdmetResult();
    }, [compound.id]);

    // 获取已有的ADMET结果
    const fetchAdmetResult = async () => {
        try {
            const response = await admetAPI.getResultByCompoundId(compound.id);
            if (response.success && response.data) {
                setAdmetResult(response.data);
                console.log('✅ 已加载ADMET结果:', response.data);
            }
        } catch (error) {
            console.log('暂无ADMET预测结果');
        }
    };

    // 执行ADMET预测
    const handleAdmetPredict = async () => {
        try {
            setAdmetLoading(true);
            console.log('🧪 开始ADMET预测...');
            
            const response = await admetAPI.predict(compound.id);
            
            if (response.success && response.data) {
                setAdmetResult(response.data);
                console.log('✅ ADMET预测完成:', response.data);
                Alert.alert('预测完成', 'ADMET毒性预测已完成');
            } else {
                Alert.alert('预测失败', response.message || '无法完成ADMET预测');
            }
        } catch (error: any) {
            console.error('❌ ADMET预测失败:', error);
            Alert.alert('错误', error.response?.data?.message || 'ADMET预测失败');
        } finally {
            setAdmetLoading(false);
        }
    };

    const handleDocking = async () => {
        console.log('🔬 开始分子对接流程...');
        console.log('化合物ID:', compound.id);
        console.log('化合物名称:', compound.name);
        
        try {
            setDocking(true);
            setDockingStatus('提交对接任务...');
            
            // 🎬 启动对接动画
            setIsDockingAnimating(true);
            
            console.log('📤 正在提交对接任务到后端...');
            
            // 1. 提交对接任务
            const submitResponse = await dockingAPI.submitDocking(compound.id);
            
            console.log('📥 提交响应:', submitResponse);
            
            if (!submitResponse.success) {
                console.error('❌ 提交失败:', submitResponse.message);
                Alert.alert('提交失败', submitResponse.message || '无法提交对接任务');
                setDocking(false);
                setIsDockingAnimating(false);
                return;
            }
            
            console.log('✅ 任务提交成功，开始轮询结果...');
            setDockingStatus('对接中，请稍候...');
            
            // 2. 轮询查询结果（每3秒查询一次）
            let attempts = 0;
            const maxAttempts = 20; // 最多轮询20次（60秒）
            
            const pollInterval = setInterval(async () => {
                attempts++;
                console.log(`🔄 轮询第 ${attempts}/${maxAttempts} 次...`);
                
                try {
                    const resultResponse = await dockingAPI.getResultByCompoundId(compound.id);
                    console.log('查询响应:', resultResponse);
                    
                    if (resultResponse.success && resultResponse.data) {
                        const result = resultResponse.data;
                        console.log('对接状态:', result.status);
                        
                        if (result.status === 'completed') {
                            // 对接完成
                            console.log('✅ 对接完成！');
                            console.log('结合亲和力:', result.affinity);
                            console.log('相似度分数:', result.similarityScore);
                            
                            clearInterval(pollInterval);
                            setDockingResult(result);
                            setDocking(false);
                            setDockingStatus('');
                            
                            // 动画会在完成后自动停止
                            
                            Alert.alert(
                                '对接完成',
                                `结合亲和力: ${result.affinity} kcal/mol\n相似度分数: ${(result.similarityScore * 100).toFixed(1)}%`,
                                [{ text: '确定' }]
                            );
                            
                            // 更新3D视图为对接后的配体
                            if (result.dockedPdbqtContent) {
                                console.log('更新3D视图为对接后的配体');
                                setLigand(result.dockedPdbqtContent);
                            }
                        } else if (result.status === 'failed') {
                            // 对接失败
                            console.error('❌ 对接失败');
                            clearInterval(pollInterval);
                            setDocking(false);
                            setDockingStatus('');
                            setIsDockingAnimating(false);
                            Alert.alert('对接失败', '分子对接过程出现错误，请重试');
                        } else {
                            // 仍在进行中
                            console.log('⏳ 对接仍在进行中...');
                            setDockingStatus(`对接中... (${attempts}/${maxAttempts})`);
                        }
                    }
                } catch (error) {
                    console.error('❌ 查询对接结果失败:', error);
                }
                
                // 超时处理
                if (attempts >= maxAttempts) {
                    console.warn('⏰ 轮询超时');
                    clearInterval(pollInterval);
                    setDocking(false);
                    setDockingStatus('');
                    setIsDockingAnimating(false);
                    Alert.alert('超时', '对接任务执行时间过长，请稍后在报告页面查看结果');
                }
            }, 3000);
            
        } catch (error: any) {
            console.error('❌ 对接失败:', error);
            console.error('错误详情:', error.response?.data);
            Alert.alert('错误', error.response?.data?.message || '对接任务提交失败');
            setDocking(false);
            setDockingStatus('');
            setIsDockingAnimating(false);
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

                {/* 2. 3D 可视化区域 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3D 分子对接模型</Text>
                    <Text style={styles.hint}>
                        <MaterialCommunityIcons name="gesture-swipe" size={14} color={theme.colors.text.light} />
                        {' '}单指旋转 · 双指缩放 · 查看蛋白质-配体复合物
                    </Text>
                    
                    {/* 3D 视图容器 */}
                    <View style={styles.moleculeContainer}>
                        {loading3D ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={styles.loadingText}>加载 3D 模型中...</Text>
                            </View>
                        ) : (!receptor && !ligand) ? (
                            <View style={styles.loadingContainer}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FFA726" />
                                <Text style={styles.loadingText}>暂无 3D 结构数据</Text>
                                <Text style={[styles.loadingText, { fontSize: 12, marginTop: 8 }]}>
                                    后端数据不完整，请联系管理员
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Canvas camera={{ position: [0, 0, 50], fov: 45 }}>
                                    <color attach="background" args={['#1a1a2e']} />
                                    
                                    {/* 专业的三点光照系统 */}
                                    <ambientLight intensity={0.4} />
                                    <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
                                    <directionalLight position={[-10, -10, -10]} intensity={0.3} />
                                    <pointLight position={[0, 20, 0]} intensity={0.5} color="#ffffff" />
                                    
                                    {/* 场景组（用于AR效果） */}
                                    <group ref={sceneGroupRef}>
                                        {/* 只使用卡通样式 */}
                                        {receptor && <CartoonProtein pdb={receptor} />}
                                        
                                        {ligand && (
                                            <group ref={ligandGroupRef}>
                                                <StickLigand pdbqt={ligand} />
                                            </group>
                                        )}
                                    </group>
                                    
                                    {/* AR视差效果 */}
                                    <ARParallax 
                                        enabled={arMode && arAvailable}
                                        targetGroup={sceneGroupRef.current}
                                        intensity={0.7}
                                    />
                                    
                                    {/* 对接动画控制器 */}
                                    <DockingAnimation 
                                        ligandGroup={ligandGroupRef.current}
                                        isAnimating={isDockingAnimating}
                                        onComplete={() => setIsDockingAnimating(false)}
                                    />
                                    
                                    <OrbitControls 
                                        enableDamping
                                        dampingFactor={0.05}
                                        rotateSpeed={0.5}
                                        enableZoom={true}
                                        enabled={!arMode}
                                    />
                                </Canvas>
                                
                                {/* AR模式切换按钮 */}
                                <TouchableOpacity 
                                    style={[styles.arButton, arMode && styles.arButtonActive]}
                                    onPress={() => {
                                        if (!arAvailable) {
                                            Alert.alert('AR不可用', '您的设备不支持运动传感器，无法使用AR功能');
                                            return;
                                        }
                                        setArMode(!arMode);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons 
                                        name={arMode ? "augmented-reality" : "rotate-3d"} 
                                        size={20} 
                                        color="white" 
                                    />
                                    <Text style={styles.arButtonText}>
                                        {arMode ? 'AR' : '3D'}
                                    </Text>
                                </TouchableOpacity>
                                
                                {/* 全屏按钮 */}
                                <TouchableOpacity 
                                    style={styles.fullscreenButton}
                                    onPress={() => setFullscreen3D(true)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="fullscreen" size={24} color="white" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    
                    {/* AR模式提示 */}
                    {arMode && arAvailable && (
                        <View style={styles.arHint}>
                            <MaterialCommunityIcons name="cellphone-arrow-down" size={20} color="#4CAF50" />
                            <Text style={styles.arHintText}>
                                倾斜手机查看AR效果 · 分子会随手机移动
                            </Text>
                        </View>
                    )}
                    
                    {/* AR角度显示器 */}
                    {arMode && arAvailable && (
                        <View style={styles.arAngleDisplay}>
                            <View style={styles.arAngleItem}>
                                <Text style={styles.arAngleLabel}>前后倾斜:</Text>
                                <Text style={styles.arAngleValue}>{arAngles.beta.toFixed(1)}°</Text>
                            </View>
                            <View style={styles.arAngleDivider} />
                            <View style={styles.arAngleItem}>
                                <Text style={styles.arAngleLabel}>左右倾斜:</Text>
                                <Text style={styles.arAngleValue}>{arAngles.gamma.toFixed(1)}°</Text>
                            </View>
                        </View>
                    )}
                    
                    {/* 倾斜角度提示 */}
                    {arMode && arAvailable && Math.abs(arAngles.beta) < 5 && Math.abs(arAngles.gamma) < 5 && (
                        <View style={styles.arTipBox}>
                            <MaterialCommunityIcons name="information" size={16} color="#FF9800" />
                            <Text style={styles.arTipText}>
                                💡 倾斜角度较小，尝试关闭屏幕旋转锁定以获得更大角度
                            </Text>
                        </View>
                    )}
                    
                    {/* AR调试信息 */}
                    {__DEV__ && arDebugInfo && !arMode && (
                        <View style={styles.debugInfo}>
                            <Text style={styles.debugText}>{arDebugInfo}</Text>
                        </View>
                    )}
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

                {/* 4. ADMET 预测 (五维雷达图) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ADMET 毒性预测</Text>
                    
                    {!admetResult ? (
                        <View style={styles.chartPlaceholder}>
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
                            {/* 综合评价 */}
                            {(() => {
                                const assessment = getAdmetOverallAssessment(admetResult);
                                return (
                                    <View style={[styles.assessmentBanner, { backgroundColor: assessment.color + '20', borderColor: assessment.color }]}>
                                        <Text style={[styles.assessmentGrade, { color: assessment.color }]}>
                                            {assessment.grade}
                                        </Text>
                                        <Text style={styles.assessmentScore}>
                                            综合安全性: {assessment.score.toFixed(1)}
                                        </Text>
                                    </View>
                                );
                            })()}
                            
                            {/* 五维雷达图 */}
                            <View style={styles.radarContainer}>
                                <Text style={styles.radarTitle}>五维安全性评估</Text>
                                {(() => {
                                    const data = getRadarData(admetResult);
                                    return (
                                        <RadarChart 
                                            data={data.datasets[0].data}
                                            labels={data.labels}
                                            size={280}
                                        />
                                    );
                                })()}
                            </View>
                        </View>
                    )}
                </View>

                {/* 5. 对接操作栏 */}
                <TouchableOpacity 
                    style={[styles.dockingButton, docking && styles.dockingButtonDisabled]} 
                    onPress={handleDocking} 
                    activeOpacity={0.8}
                    disabled={docking}
                >
                    {docking ? (
                        <>
                            <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>{dockingStatus}</Text>
                        </>
                    ) : (
                        <>
                            <MaterialCommunityIcons name="dna" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>开始 Vina 分子对接</Text>
                        </>
                    )}
                </TouchableOpacity>
                
                {/* 对接结果显示 */}
                {dockingResult && (
                    <View style={styles.dockingResultCard}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                            <Text style={styles.resultTitle}>对接完成</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>结合亲和力:</Text>
                            <Text style={styles.resultValue}>{dockingResult.affinity} kcal/mol</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>相似度分数:</Text>
                            <Text style={styles.resultValue}>{(dockingResult.similarityScore * 100).toFixed(1)}%</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>状态:</Text>
                            <Text style={[styles.resultValue, { color: '#4CAF50' }]}>{dockingResult.status}</Text>
                        </View>
                    </View>
                )}

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
            
            {/* 全屏3D查看器模态框 */}
            <Modal
                visible={fullscreen3D}
                animationType="fade"
                onRequestClose={() => setFullscreen3D(false)}
                statusBarTranslucent
            >
                <View style={styles.fullscreenContainer}>
                    {/* 顶部工具栏 */}
                    <View style={styles.fullscreenHeader}>
                        <View style={styles.fullscreenHeaderLeft}>
                            <Text style={styles.fullscreenTitle}>{compound.name}</Text>
                            <Text style={styles.fullscreenSubtitle}>3D 分子对接模型</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setFullscreen3D(false)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* 全屏3D视图 */}
                    <View style={styles.fullscreen3DView}>
                        {(!receptor && !ligand) ? (
                            <View style={styles.loadingContainer}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FFA726" />
                                <Text style={[styles.loadingText, { fontSize: 16 }]}>暂无 3D 结构数据</Text>
                            </View>
                        ) : (
                            <>
                                <Canvas camera={{ position: [0, 0, 50], fov: 45 }}>
                                    <color attach="background" args={['#0a0a1a']} />
                                    
                                    {/* 专业的三点光照系统 */}
                                    <ambientLight intensity={0.4} />
                                    <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
                                    <directionalLight position={[-10, -10, -10]} intensity={0.3} />
                                    <pointLight position={[0, 20, 0]} intensity={0.5} color="#ffffff" />
                                    
                                    {/* 场景组（用于AR效果） */}
                                    <group ref={sceneGroupRef}>
                                        {/* 只使用卡通样式 */}
                                        {receptor && <CartoonProtein pdb={receptor} />}
                                        
                                        {ligand && (
                                            <group ref={ligandGroupRef}>
                                                <StickLigand pdbqt={ligand} />
                                            </group>
                                        )}
                                    </group>
                                    
                                    {/* AR视差效果 */}
                                    <ARParallax 
                                        enabled={arMode && arAvailable}
                                        targetGroup={sceneGroupRef.current}
                                        intensity={0.8}
                                    />
                                    
                                    {/* 对接动画控制器 */}
                                    <DockingAnimation 
                                        ligandGroup={ligandGroupRef.current}
                                        isAnimating={isDockingAnimating}
                                        onComplete={() => setIsDockingAnimating(false)}
                                    />
                                    
                                    <OrbitControls 
                                        enableDamping
                                        dampingFactor={0.05}
                                        rotateSpeed={0.5}
                                        enabled={!arMode}
                                    />
                                </Canvas>
                                
                                {/* AR模式切换按钮（全屏） */}
                                <TouchableOpacity 
                                    style={[styles.fullscreenArButton, arMode && styles.fullscreenArButtonActive]}
                                    onPress={() => {
                                        if (!arAvailable) {
                                            Alert.alert('AR不可用', '您的设备不支持运动传感器，无法使用AR功能');
                                            return;
                                        }
                                        setArMode(!arMode);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons 
                                        name={arMode ? "augmented-reality" : "rotate-3d"} 
                                        size={24} 
                                        color="white" 
                                    />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    
                    {/* 底部控制栏 */}
                    <View style={styles.fullscreenControls}>
                        {/* AR模式提示 */}
                        {arMode && arAvailable && (
                            <View style={styles.fullscreenArHint}>
                                <MaterialCommunityIcons name="cellphone-arrow-down" size={18} color="#4CAF50" />
                                <Text style={styles.fullscreenArHintText}>
                                    倾斜手机查看AR效果 · 分子会随手机移动
                                </Text>
                            </View>
                        )}
                        
                        <View style={styles.fullscreenHint}>
                            <MaterialCommunityIcons name="gesture-swipe" size={16} color="#999" />
                            <Text style={styles.fullscreenHintText}>
                                单指旋转 · 双指缩放 · 查看蛋白质-配体复合物
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
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
    sectionTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: theme.colors.text.primary, 
        marginBottom: 8, 
        borderLeftWidth: 4, 
        borderLeftColor: theme.colors.primary, 
        paddingLeft: 8 
    },
    hint: {
        fontSize: 12,
        color: theme.colors.text.light,
        marginBottom: 12,
        fontStyle: 'italic'
    },
    moleculeContainer: {
        height: 350,
        width: '100%',
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        ...theme.shadows.strong
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a'
    },
    loadingText: {
        color: '#999',
        fontSize: 14,
        marginTop: 12
    },
    chartPlaceholder: {
        height: 180, backgroundColor: '#FFF3E0', borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#FFE0B2'
    },
    placeholderText: { marginTop: 8, fontSize: 14, fontWeight: 'bold', color: theme.colors.text.secondary },
    subText: { fontSize: 12, color: theme.colors.text.light },
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
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 2,
        alignItems: 'center',
    },
    assessmentGrade: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    assessmentScore: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    radarContainer: {
        marginTop: 8,
    },
    radarTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
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
    dockingButtonDisabled: {
        backgroundColor: '#81C784',
        opacity: 0.7,
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    dockingResultCard: {
        backgroundColor: 'white',
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        ...theme.shadows.card,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    resultLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    resultValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    proteinModeSelector: {
        marginTop: 12,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        ...theme.shadows.card,
    },
    modeSelectorLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    modeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    modeButtonText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    modeButtonTextActive: {
        color: 'white',
    },
    fullscreenButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        padding: 10,
        ...theme.shadows.strong,
    },
    arButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.strong,
    },
    arButtonActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
    },
    arButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    arHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    arHintText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 8,
        fontWeight: '600',
    },
    arAngleDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    arAngleItem: {
        flex: 1,
        alignItems: 'center',
    },
    arAngleLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
    },
    arAngleValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        fontFamily: 'monospace',
    },
    arAngleDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
    arTipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },
    arTipText: {
        fontSize: 11,
        color: '#FF9800',
        marginLeft: 6,
        flex: 1,
    },
    fullscreenArButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 12,
        ...theme.shadows.strong,
    },
    fullscreenArButtonActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
    },
    fullscreenArHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    fullscreenArHintText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 8,
        fontWeight: '600',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#0a0a1a',
    },
    fullscreenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    fullscreenHeaderLeft: {
        flex: 1,
    },
    fullscreenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    fullscreenSubtitle: {
        fontSize: 14,
        color: '#999',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    fullscreen3DView: {
        flex: 1,
    },
    fullscreenControls: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    fullscreenModeSelector: {
        marginBottom: 12,
    },
    fullscreenModeLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
        fontWeight: '600',
    },
    fullscreenModeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    fullscreenModeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    fullscreenModeButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    fullscreenModeButtonText: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
    },
    fullscreenModeButtonTextActive: {
        color: 'white',
    },
    fullscreenHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    fullscreenHintText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 6,
        fontStyle: 'italic',
    },
    debugInfo: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    debugText: {
        fontSize: 10,
        color: '#4CAF50',
        fontFamily: 'monospace',
    },
});