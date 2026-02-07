import React, { useMemo } from 'react';
import * as THREE from 'three';
import { parseLigand, getAtomColor, getAtomRadius } from '../../utils/moleculeUtils';

interface Props {
    pdbqt: string | null; // 允许为空
}

export const StickLigand: React.FC<Props> = ({ pdbqt }) => {
    const { atoms, bonds } = useMemo(() => {
        const result = parseLigand(pdbqt);
        console.log(`StickLigand: 解析到 ${result.atoms.length} 个原子, ${result.bonds.length} 个化学键`);
        return result;
    }, [pdbqt]);
    
    // 如果没有原子，返回 null (防止渲染空 group 报错)
    if (!atoms || atoms.length === 0) {
        console.log('StickLigand: 没有原子数据');
        return null;
    }
    
    return (
        <group>
            {/* 原子 (球棍模型) - 更专业的CPK配色 */}
            {atoms.map((atom, i) => {
                const color = getAtomColor(atom.element);
                const radius = getAtomRadius(atom.element) * 0.8; // 稍微小一点，更符合球棍模型
                
                return (
                    <mesh key={`atom-${i}`} position={[atom.pos.x, atom.pos.y, atom.pos.z]}>
                        <sphereGeometry args={[radius, 24, 24]} />
                        <meshStandardMaterial 
                            color={color}
                            roughness={0.3}
                            metalness={0.1}
                            emissive={color}
                            emissiveIntensity={0.2}
                        />
                    </mesh>
                );
            })}
            
            {/* 化学键 (棍) - 更细更专业的表现 */}
            {bonds.map((bond, i) => {
                const start = bond.start;
                const end = bond.end;
                const distance = start.distanceTo(end);
                const position = start.clone().add(end).multiplyScalar(0.5);
                
                const up = new THREE.Vector3(0, 1, 0);
                const direction = end.clone().sub(start).normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
                
                // React Three Fiber 9.x: 将 quaternion 转为数组
                const quatArray: [number, number, number, number] = [
                    quaternion.x,
                    quaternion.y,
                    quaternion.z,
                    quaternion.w
                ];
                
                return (
                    <mesh 
                        key={`bond-${i}`}
                        position={[position.x, position.y, position.z]}
                        quaternion={quatArray}
                    >
                        <cylinderGeometry args={[0.15, 0.15, distance, 16]} />
                        <meshStandardMaterial 
                            color="#D0D0D0"
                            roughness={0.4}
                            metalness={0.2}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};
