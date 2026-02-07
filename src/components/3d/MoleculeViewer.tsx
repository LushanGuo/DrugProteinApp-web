import React, { Suspense } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, Stars } from '@react-three/drei/native';
import * as THREE from 'three';
import { ProteinModel } from './ProteinModel';
import { LigandModel } from './LigandModel';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    receptorPdb: string | null;
    ligandPdbqt: string | null;
}

export const MoleculeViewer: React.FC<Props> = ({ receptorPdb, ligandPdbqt }) => {
    // 如果两个数据都为空，显示空状态
    if (!receptorPdb && !ligandPdbqt) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="molecule" size={64} color="#666" />
                <Text style={styles.emptyText}>暂无 3D 结构数据</Text>
                <Text style={styles.emptySubtext}>该化合物的结构数据尚未生成</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Canvas 
                camera={{ position: [0, 0, 50], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                {/* 深色背景 */}
                <color attach="background" args={['#0a0a0a']} />
                
                {/* 背景星空效果 */}
                <Stars 
                    radius={150} 
                    depth={80} 
                    count={2000} 
                    factor={5} 
                    saturation={0} 
                    fade={true}
                    speed={0.3}
                />
                
                {/* 光照系统 */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[15, 20, 15]} intensity={1.5} />
                <directionalLight position={[-10, -15, -10]} intensity={0.6} color="#4A90E2" />
                <pointLight position={[20, 0, 10]} intensity={1.2} color="#7E57C2" />
                <pointLight position={[-20, 0, 10]} intensity={1.2} color="#26C6DA" />
                <pointLight position={[0, 0, -30]} intensity={0.5} color="#5E35B1" />
                <hemisphereLight args={['#7E57C2', '#1a1a1a', 0.6]} position={[0, 50, 0]} />

                {/* 分子模型 */}
                <Suspense fallback={null}>
                    {receptorPdb && <ProteinModel pdb={receptorPdb} />}
                    {ligandPdbqt && <LigandModel pdbqt={ligandPdbqt} />}
                </Suspense>

                {/* 交互控制 */}
                <OrbitControls 
                    makeDefault={true}
                    enableDamping={true}
                    dampingFactor={0.08}
                    rotateSpeed={0.6}
                    zoomSpeed={1.0}
                    minDistance={15}
                    maxDistance={120}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
            
            {/* 美化的图例 */}
            <View style={styles.legend}>
                <View style={styles.legendHeader}>
                    <MaterialCommunityIcons name="palette" size={16} color="#fff" />
                    <Text style={styles.legendTitle}>元素图例</Text>
                </View>
                
                {receptorPdb && (
                    <View style={styles.legendSection}>
                        <Text style={styles.legendSectionTitle}>蛋白质 (CDK2)</Text>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: '#A0A0A0' }]} />
                            <Text style={styles.legendLabel}>碳 (C)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: '#5B9BD5' }]} />
                            <Text style={styles.legendLabel}>氮 (N)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: '#ED7D31' }]} />
                            <Text style={styles.legendLabel}>氧 (O)</Text>
                        </View>
                    </View>
                )}
                
                {ligandPdbqt && (
                    <View style={styles.legendSection}>
                        <Text style={styles.legendSectionTitle}>配体分子</Text>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: '#50C878' }]} />
                            <Text style={styles.legendLabel}>碳 (C)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: '#4169E1' }]} />
                            <Text style={styles.legendLabel}>氮 (N)</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: '#FF4500' }]} />
                            <Text style={styles.legendLabel}>氧 (O)</Text>
                        </View>
                    </View>
                )}
            </View>
            
            {/* 操作提示 */}
            <View style={styles.hint}>
                <MaterialCommunityIcons name="gesture-swipe" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.hintText}>拖动旋转 · 双指缩放</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
    },
    emptySubtext: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    legend: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 12,
        padding: 12,
        maxWidth: 180,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    legendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    legendTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    legendSection: {
        marginTop: 8,
    },
    legendSectionTitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    legendLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 11,
    },
    hint: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    hintText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        fontStyle: 'italic',
    },
});