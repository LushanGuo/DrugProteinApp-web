// 简化版 3D 分子查看器 - 移除所有可能导致错误的高级特性
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls } from '@react-three/drei/native';
import * as THREE from 'three';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    receptorPdb: string | null;
    ligandPdbqt: string | null;
}

// 简化的配体模型
function SimpleLigand({ pdbqt }: { pdbqt: string }) {
    const atoms = React.useMemo(() => {
        // 添加数据验证
        if (!pdbqt || typeof pdbqt !== 'string' || pdbqt.length === 0) {
            console.log('SimpleLigand: PDBQT 数据无效或为空');
            return [];
        }
        
        const lines = pdbqt.split('\n');
        const atomData: Array<{ x: number; y: number; z: number; element: string }> = [];

        lines.forEach(line => {
            if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                try {
                    const x = parseFloat(line.substring(30, 38).trim());
                    const y = parseFloat(line.substring(38, 46).trim());
                    const z = parseFloat(line.substring(46, 54).trim());
                    const element = line.length > 77 ? line.substring(76, 78).trim() : 'C';
                    
                    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        atomData.push({ x, y, z, element: element || 'C' });
                    }
                } catch (error) {
                    // 忽略
                }
            }
        });

        return atomData;
    }, [pdbqt]);

    const getColor = (element: string) => {
        const colors: { [key: string]: string } = {
            'C': '#50C878',
            'N': '#4169E1',
            'O': '#FF4500',
            'S': '#FFD700',
            'H': '#F0F0F0',
        };
        return colors[element] || '#FF1493';
    };

    if (atoms.length === 0) return null;

    return (
        <group>
            {atoms.map((atom, index) => {
                if (!atom || typeof atom.x !== 'number') return null;
                
                return (
                    <mesh key={`atom-${index}`} position={[atom.x, atom.y, atom.z]}>
                        <sphereGeometry args={[0.8, 16, 16]} />
                        <meshStandardMaterial color={getColor(atom.element)} />
                    </mesh>
                );
            })}
        </group>
    );
}

// 简化的蛋白质模型
function SimpleProtein({ pdb }: { pdb: string }) {
    const caAtoms = React.useMemo(() => {
        // 添加数据验证
        if (!pdb || typeof pdb !== 'string' || pdb.length === 0) {
            console.log('SimpleProtein: PDB 数据无效或为空');
            return [];
        }
        
        const lines = pdb.split('\n');
        const atomData: Array<{ x: number; y: number; z: number }> = [];

        lines.forEach(line => {
            if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                try {
                    const atomName = line.substring(12, 16).trim();
                    const x = parseFloat(line.substring(30, 38).trim());
                    const y = parseFloat(line.substring(38, 46).trim());
                    const z = parseFloat(line.substring(46, 54).trim());
                    
                    if (atomName === 'CA' && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        atomData.push({ x, y, z });
                    }
                } catch (error) {
                    // 忽略
                }
            }
        });

        return atomData;
    }, [pdb]);

    if (caAtoms.length === 0) return null;

    return (
        <group>
            {caAtoms.map((atom, index) => {
                if (!atom || typeof atom.x !== 'number') return null;
                
                const hue = (index / caAtoms.length) * 0.7;
                const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
                
                return (
                    <mesh key={`ca-${index}`} position={[atom.x, atom.y, atom.z]}>
                        <sphereGeometry args={[1.0, 12, 12]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                );
            })}
        </group>
    );
}

export const SimpleMoleculeViewer: React.FC<Props> = ({ receptorPdb, ligandPdbqt }) => {
    if (!receptorPdb && !ligandPdbqt) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="molecule" size={64} color="#666" />
                <Text style={styles.emptyText}>暂无 3D 结构数据</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Canvas camera={{ position: [0, 0, 50], fov: 50 }}>
                <color attach="background" args={['#0a0a0a']} />
                
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {receptorPdb && <SimpleProtein pdb={receptorPdb} />}
                {ligandPdbqt && <SimpleLigand pdbqt={ligandPdbqt} />}

                <OrbitControls />
            </Canvas>
            
            <View style={styles.hint}>
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
    hint: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
    },
});
