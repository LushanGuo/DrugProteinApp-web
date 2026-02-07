// src/components/3d/DockingAnimation.tsx - 科学的分子对接动画组件
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

interface DockingAnimationProps {
  ligandGroup: THREE.Group | null;
  isAnimating: boolean;
  onComplete: () => void;
}

export const DockingAnimation: React.FC<DockingAnimationProps> = ({
  ligandGroup,
  isAnimating,
  onComplete,
}) => {
  const animationProgress = useRef(0);
  const initialPosition = useRef<THREE.Vector3 | null>(null);
  const initialRotation = useRef<THREE.Euler | null>(null);

  useEffect(() => {
    if (isAnimating && ligandGroup && !initialPosition.current) {
      // 保存最终位置和旋转
      initialPosition.current = ligandGroup.position.clone();
      initialRotation.current = ligandGroup.rotation.clone();
      
      // 设置起始位置：从结合口袋上方接近（更科学的对接路径）
      // 配体从蛋白质上方约20单位的位置开始
      ligandGroup.position.set(
        initialPosition.current.x,
        initialPosition.current.y + 25,
        initialPosition.current.z + 15
      );
      
      // 初始旋转：配体稍微倾斜
      ligandGroup.rotation.set(
        Math.PI * 0.3,
        Math.PI * 0.2,
        0
      );
      
      animationProgress.current = 0;
      console.log('🎬 开始科学对接动画');
    }
  }, [isAnimating, ligandGroup]);

  useFrame((state, delta) => {
    if (!isAnimating || !ligandGroup || !initialPosition.current || !initialRotation.current) return;

    // 动画进度（0 到 1）- 稍微慢一点，更真实
    animationProgress.current += delta * 0.25;

    if (animationProgress.current >= 1) {
      // 动画完成 - 精确定位到最终位置
      ligandGroup.position.copy(initialPosition.current);
      ligandGroup.rotation.copy(initialRotation.current);
      animationProgress.current = 0;
      initialPosition.current = null;
      initialRotation.current = null;
      onComplete();
      console.log('✅ 对接动画完成');
      return;
    }

    const t = animationProgress.current;
    
    // 分阶段动画：
    // 阶段1 (0-0.4): 快速接近结合口袋
    // 阶段2 (0.4-0.7): 减速并调整姿态
    // 阶段3 (0.7-1.0): 精确定位和微调
    
    let eased: number;
    if (t < 0.4) {
      // 快速接近阶段 - 线性运动
      eased = t / 0.4 * 0.6;
    } else if (t < 0.7) {
      // 调整姿态阶段 - 减速
      const localT = (t - 0.4) / 0.3;
      eased = 0.6 + localT * localT * 0.25;
    } else {
      // 精确定位阶段 - 缓慢进入
      const localT = (t - 0.7) / 0.3;
      eased = 0.85 + (1 - Math.pow(1 - localT, 3)) * 0.15;
    }

    // 起始位置
    const startPos = new THREE.Vector3(
      initialPosition.current.x,
      initialPosition.current.y + 25,
      initialPosition.current.z + 15
    );

    // 位置插值 - 平滑移动到结合位点
    ligandGroup.position.lerpVectors(startPos, initialPosition.current, eased);

    // 旋转动画 - 更自然的姿态调整
    if (t < 0.7) {
      // 前70%：主要旋转调整
      ligandGroup.rotation.x = Math.PI * 0.3 * (1 - eased);
      ligandGroup.rotation.y = Math.PI * 0.2 * (1 - eased) + initialRotation.current.y * eased;
      ligandGroup.rotation.z = initialRotation.current.z * eased;
    } else {
      // 后30%：微调到最终姿态
      const fineT = (t - 0.7) / 0.3;
      ligandGroup.rotation.x = THREE.MathUtils.lerp(
        ligandGroup.rotation.x,
        initialRotation.current.x,
        fineT
      );
      ligandGroup.rotation.y = THREE.MathUtils.lerp(
        ligandGroup.rotation.y,
        initialRotation.current.y,
        fineT
      );
      ligandGroup.rotation.z = THREE.MathUtils.lerp(
        ligandGroup.rotation.z,
        initialRotation.current.z,
        fineT
      );
    }

    // 添加轻微的摆动效果（模拟分子热运动）
    if (t > 0.4 && t < 0.9) {
      const wobble = Math.sin(t * Math.PI * 8) * 0.3 * (1 - eased);
      ligandGroup.position.x += wobble;
      ligandGroup.position.z += Math.cos(t * Math.PI * 6) * wobble;
    }
  });

  return null;  // 这是一个逻辑组件，不渲染任何内容
};
