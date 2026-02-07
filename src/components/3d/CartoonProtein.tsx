// src/components/3d/CartoonProtein.tsx - 卡通带状蛋白质渲染
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { parseProteinBackbone } from '../../utils/moleculeUtils';

interface Props {
    pdb: string | null;
}

export const CartoonProtein: React.FC<Props> = ({ pdb }) => {
    const ribbonGeometry = useMemo(() => {
        if (!pdb) {
            console.log('CartoonProtein: PDB 数据为空');
            return null;
        }
        
        const points = parseProteinBackbone(pdb);
        
        console.log(`CartoonProtein: 解析到 ${points.length} 个 CA 原子`);
        
        if (points.length < 4) {
            console.log('CartoonProtein: CA 原子数量不足');
            return null;
        }
        
        try {
            // 创建平滑的样条曲线
            const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
            
            // 生成带状几何体（扁平的管状结构）
            const segments = points.length * 8;
            const curvePoints = curve.getPoints(segments);
            
            // 创建带状几何体
            const geometry = new THREE.BufferGeometry();
            const vertices: number[] = [];
            const colors: number[] = [];
            const indices: number[] = [];
            
            const ribbonWidth = 2.5; // 带状宽度
            const color = new THREE.Color();
            
            // 为每个点创建垂直于曲线的矩形截面
            for (let i = 0; i < curvePoints.length; i++) {
                const point = curvePoints[i];
                const progress = i / curvePoints.length;
                
                // 计算切线方向
                let tangent: THREE.Vector3;
                if (i < curvePoints.length - 1) {
                    tangent = new THREE.Vector3()
                        .subVectors(curvePoints[i + 1], point)
                        .normalize();
                } else {
                    tangent = new THREE.Vector3()
                        .subVectors(point, curvePoints[i - 1])
                        .normalize();
                }
                
                // 计算法线（垂直于切线）
                const up = new THREE.Vector3(0, 1, 0);
                const normal = new THREE.Vector3()
                    .crossVectors(tangent, up)
                    .normalize();
                
                // 如果法线为零向量，使用备用方向
                if (normal.length() < 0.1) {
                    normal.set(1, 0, 0);
                }
                
                // 创建带状的两个边缘点
                const offset = normal.multiplyScalar(ribbonWidth / 2);
                const p1 = point.clone().add(offset);
                const p2 = point.clone().sub(offset);
                
                vertices.push(p1.x, p1.y, p1.z);
                vertices.push(p2.x, p2.y, p2.z);
                
                // 渐变色：从青色到紫色
                const hue = 0.5 + progress * 0.3; // 青色(0.5)到紫色(0.8)
                const saturation = 0.8;
                const lightness = 0.5 + Math.sin(progress * Math.PI) * 0.15;
                
                color.setHSL(hue, saturation, lightness);
                
                // 每个点两个顶点，颜色相同
                colors.push(color.r, color.g, color.b);
                colors.push(color.r, color.g, color.b);
                
                // 创建三角形索引
                if (i < curvePoints.length - 1) {
                    const base = i * 2;
                    // 第一个三角形
                    indices.push(base, base + 1, base + 2);
                    // 第二个三角形
                    indices.push(base + 1, base + 3, base + 2);
                }
            }
            
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();
            
            return geometry;
        } catch (e) {
            console.error('CartoonProtein: 几何体生成失败:', e);
            return null;
        }
    }, [pdb]);
    
    if (!ribbonGeometry) return null;
    
    return (
        <mesh geometry={ribbonGeometry}>
            <meshStandardMaterial 
                vertexColors={true}
                side={THREE.DoubleSide}
                roughness={0.3}
                metalness={0.2}
                emissive="#0a0a1e"
                emissiveIntensity={0.1}
            />
        </mesh>
    );
};
