// src/components/3d/LigandModel.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
    pdbqt: string;
}

interface Atom {
    x: number;
    y: number;
    z: number;
    element: string;
}

export const LigandModel: React.FC<Props> = ({ pdbqt }) => {
    // 解析 PDBQT 数据
    const { atoms, center } = useMemo(() => {
        if (!pdbqt) return { atoms: [], center: { x: 0, y: 0, z: 0 } };
        
        const lines = pdbqt.split('\n');
        const atomData: Atom[] = [];

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
                    // 忽略解析错误的行
                }
            }
        });

        // 计算中心点
        let centerX = 0, centerY = 0, centerZ = 0;
        if (atomData.length > 0) {
            atomData.forEach(atom => {
                centerX += atom.x;
                centerY += atom.y;
                centerZ += atom.z;
            });
            centerX /= atomData.length;
            centerY /= atomData.length;
            centerZ /= atomData.length;
        }

        console.log(`LigandModel: 解析了 ${atomData.length} 个原子`);
        return { atoms: atomData, center: { x: centerX, y: centerY, z: centerZ } };
    }, [pdbqt]);

    // 根据元素类型返回颜色（更鲜艳的配色）
    const getAtomColor = (element: string) => {
        const colors: { [key: string]: string } = {
            'C': '#50C878',  // 碳 - 翠绿色
            'N': '#4169E1',  // 氮 - 皇家蓝
            'O': '#FF4500',  // 氧 - 橙红色
            'S': '#FFD700',  // 硫 - 金色
            'H': '#F0F0F0',  // 氢 - 白色
            'P': '#FF69B4',  // 磷 - 粉红色
            'F': '#00FF7F',  // 氟 - 春绿色
            'Cl': '#00FA9A', // 氯 - 中春绿色
            'Br': '#8B4513', // 溴 - 马鞍棕色
        };
        return colors[element] || '#FF1493'; // 默认深粉色
    };

    if (atoms.length === 0) {
        return null;
    }

    return (
        <group>
            {/* 渲染原子 */}
            {atoms.map((atom, index) => {
                // 添加安全检查
                if (!atom || typeof atom.x !== 'number' || typeof atom.y !== 'number' || typeof atom.z !== 'number') {
                    return null;
                }
                
                const color = getAtomColor(atom.element);
                const position: [number, number, number] = [
                    atom.x - center.x, 
                    atom.y - center.y, 
                    atom.z - center.z
                ];
                
                return (
                    <group key={`ligand-atom-${index}`}>
                        {/* 主球体 */}
                        <mesh position={position}>
                            <sphereGeometry args={[0.7, 20, 20]} />
                            <meshStandardMaterial 
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.5}
                                metalness={0.7}
                                roughness={0.2}
                            />
                        </mesh>
                        
                        {/* 内层发光效果 */}
                        <mesh position={position}>
                            <sphereGeometry args={[0.9, 16, 16]} />
                            <meshBasicMaterial 
                                color={color}
                                transparent={true}
                                opacity={0.3}
                            />
                        </mesh>
                        
                        {/* 外层光晕 */}
                        <mesh position={position}>
                            <sphereGeometry args={[1.3, 12, 12]} />
                            <meshBasicMaterial 
                                color={color}
                                transparent={true}
                                opacity={0.1}
                            />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
};
