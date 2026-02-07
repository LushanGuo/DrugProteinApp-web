// src/components/3d/ProteinModel.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
    pdb: string;
}

interface Atom {
    x: number;
    y: number;
    z: number;
    element: string;
    residue: string;
    atomName: string;
    residueNum: number;
}

export const ProteinModel: React.FC<Props> = ({ pdb }) => {
    // 解析 PDB 数据
    const { caAtoms, backboneAtoms, center } = useMemo(() => {
        if (!pdb) return { caAtoms: [], backboneAtoms: [], center: { x: 0, y: 0, z: 0 } };
        
        const lines = pdb.split('\n');
        const caData: Atom[] = [];
        const backboneData: Atom[] = [];

        lines.forEach(line => {
            if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                try {
                    const atomName = line.substring(12, 16).trim();
                    const residue = line.substring(17, 20).trim();
                    const residueNum = parseInt(line.substring(22, 26).trim());
                    const x = parseFloat(line.substring(30, 38).trim());
                    const y = parseFloat(line.substring(38, 46).trim());
                    const z = parseFloat(line.substring(46, 54).trim());
                    const element = line.length > 77 ? line.substring(76, 78).trim() : 'C';
                    
                    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        const atom = { x, y, z, element, residue, atomName, residueNum };
                        
                        // CA 原子用于主链
                        if (atomName === 'CA') {
                            caData.push(atom);
                        }
                        
                        // 主链原子 (CA, C, N, O)
                        if (['CA', 'C', 'N', 'O'].includes(atomName)) {
                            backboneData.push(atom);
                        }
                    }
                } catch (error) {
                    // 忽略解析错误
                }
            }
        });

        // 计算中心点
        let centerX = 0, centerY = 0, centerZ = 0;
        if (backboneData.length > 0) {
            backboneData.forEach(atom => {
                centerX += atom.x;
                centerY += atom.y;
                centerZ += atom.z;
            });
            centerX /= backboneData.length;
            centerY /= backboneData.length;
            centerZ /= backboneData.length;
        }

        console.log(`ProteinModel: 解析了 ${backboneData.length} 个主链原子, ${caData.length} 个 CA 原子`);
        return { 
            caAtoms: caData, 
            backboneAtoms: backboneData,
            center: { x: centerX, y: centerY, z: centerZ }
        };
    }, [pdb]);

    // 创建平滑的 Ribbon 曲线
    const ribbonCurve = useMemo(() => {
        if (caAtoms.length < 2) return null;
        
        const points = caAtoms
            .filter(atom => atom && typeof atom.x === 'number' && typeof atom.y === 'number' && typeof atom.z === 'number')
            .map(atom => new THREE.Vector3(atom.x - center.x, atom.y - center.y, atom.z - center.z));
        
        if (points.length < 2) return null;
        
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    }, [caAtoms, center]);

    // 根据位置生成渐变色（蓝色到紫色到红色）
    const getGradientColor = (index: number, total: number) => {
        const t = index / Math.max(1, total - 1);
        // 从深蓝 -> 青色 -> 紫色 -> 粉红
        if (t < 0.33) {
            return new THREE.Color().lerpColors(
                new THREE.Color('#1E88E5'), // 深蓝
                new THREE.Color('#26C6DA'), // 青色
                t / 0.33
            );
        } else if (t < 0.66) {
            return new THREE.Color().lerpColors(
                new THREE.Color('#26C6DA'), // 青色
                new THREE.Color('#AB47BC'), // 紫色
                (t - 0.33) / 0.33
            );
        } else {
            return new THREE.Color().lerpColors(
                new THREE.Color('#AB47BC'), // 紫色
                new THREE.Color('#EC407A'), // 粉红
                (t - 0.66) / 0.34
            );
        }
    };

    if (caAtoms.length === 0) {
        return null;
    }

    return (
        <group>
            {/* Ribbon 主链 - 使用管道几何体 */}
            {ribbonCurve && (
                <mesh>
                    <tubeGeometry 
                        args={[
                            ribbonCurve, 
                            Math.max(100, caAtoms.length * 3),
                            0.5,
                            12,
                            false
                        ]} 
                    />
                    <meshStandardMaterial 
                        color="#5E35B1"
                        emissive="#3949AB"
                        emissiveIntensity={0.2}
                        metalness={0.3}
                        roughness={0.4}
                    />
                </mesh>
            )}
            
            {/* CA 原子球体 - 带渐变色和发光效果 */}
            {caAtoms.map((atom, index) => {
                if (!atom || typeof atom.x !== 'number' || typeof atom.y !== 'number' || typeof atom.z !== 'number') {
                    return null;
                }
                
                const color = getGradientColor(index, caAtoms.length);
                const position: [number, number, number] = [
                    atom.x - center.x, 
                    atom.y - center.y, 
                    atom.z - center.z
                ];
                
                return (
                    <group key={`ca-${index}`}>
                        {/* 主球体 */}
                        <mesh position={position}>
                            <sphereGeometry args={[0.8, 16, 16]} />
                            <meshStandardMaterial 
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.4}
                                metalness={0.6}
                                roughness={0.2}
                            />
                        </mesh>
                        
                        {/* 外层发光效果 */}
                        <mesh position={position}>
                            <sphereGeometry args={[1.2, 12, 12]} />
                            <meshBasicMaterial 
                                color={color}
                                transparent={true}
                                opacity={0.15}
                            />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
};
