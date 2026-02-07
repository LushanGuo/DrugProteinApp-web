import * as THREE from 'three';

// 1. CPK 元素配色 (用于药物) - 增强版，更鲜艳
export const getAtomColor = (element: string): string => {
    switch (element.trim().toUpperCase()) {
        case 'C': return '#50C878'; // 碳-翠绿色（配体用鲜艳颜色）
        case 'O': return '#FF4500'; // 氧-橙红色
        case 'N': return '#4169E1'; // 氮-宝蓝色
        case 'S': return '#FFD700'; // 硫-金黄色
        case 'P': return '#FF8C00'; // 磷-深橙色
        case 'H': return '#F0F0F0'; // 氢-浅灰
        case 'CL': return '#00FF7F'; // 氯-春绿色
        case 'F': return '#7FFF00'; // 氟-黄绿色
        default: return '#FF1493'; // 其他-深粉色
    }
};

// 2. 原子半径 (Stick 风格，增大原子以便更清晰可见)
export const getAtomRadius = (element: string): number => {
    // 氢原子稍微小一点，其他原子作为节点
    return element.trim().toUpperCase() === 'H' ? 0.2 : 0.5;
};

// 3. 解析蛋白质骨架 (CA)
export const parseProteinBackbone = (pdbContent: string | null | undefined) => {
    const points: THREE.Vector3[] = [];
    
    // 关键修复：如果内容为空，直接返回空数组，防止 split 报错
    if (!pdbContent) {
        console.warn('parseProteinBackbone: PDB 数据为空');
        return points;
    }
    
    const lines = pdbContent.split('\n');
    
    lines.forEach(line => {
        if (line.startsWith('ATOM')) {
            const atomName = line.substring(12, 16).trim();
            if (atomName === 'CA') {
                const x = parseFloat(line.substring(30, 38));
                const y = parseFloat(line.substring(38, 46));
                const z = parseFloat(line.substring(46, 54));
                
                if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                    points.push(new THREE.Vector3(x, y, z));
                }
            }
        }
    });
    
    console.log(`parseProteinBackbone: 从 ${lines.length} 行中解析出 ${points.length} 个 CA 原子`);
    
    return points;
};

// 4. 生成彩虹色 (Spectrum Coloring)
// 根据原子在序列中的位置，生成 蓝->绿->黄->红 的颜色
export const generateRainbowColors = (count: number): Float32Array => {
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
        // HSL 颜色空间：0.6 (蓝) -> 0.0 (红)
        const hue = 0.6 * (1.0 - i / count);
        color.setHSL(hue, 1.0, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    return colors;
};

// 5. 解析配体
export const parseLigand = (pdbqtContent: string | null | undefined) => {
    const atoms: { pos: THREE.Vector3; element: string }[] = [];
    const bonds: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    
    // 关键修复：如果内容为空，返回空对象
    if (!pdbqtContent) {
        console.warn('parseLigand: PDBQT 数据为空');
        return { atoms, bonds };
    }
    
    const lines = pdbqtContent.split('\n');
    
    // 解析原子
    lines.forEach(line => {
        if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
            const x = parseFloat(line.substring(30, 38));
            const y = parseFloat(line.substring(38, 46));
            const z = parseFloat(line.substring(46, 54));
            
            let element = 'C';
            if (line.length >= 77) {
                element = line.substring(76, 78).trim();
            } else if (line.length >= 14) {
                element = line.substring(12, 14).trim().substring(0, 1);
            }
            
            // 增加 NaN 检查
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                atoms.push({ pos: new THREE.Vector3(x, y, z), element });
            }
        }
    });
    
    // 计算键
    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const dist = atoms[i].pos.distanceTo(atoms[j].pos);
            if (dist < 1.7 && dist > 0.4) {
                bonds.push({ start: atoms[i].pos, end: atoms[j].pos });
            }
        }
    }
    
    console.log(`parseLigand: 解析到 ${atoms.length} 个原子, ${bonds.length} 个化学键`);
    
    return { atoms, bonds };
};
