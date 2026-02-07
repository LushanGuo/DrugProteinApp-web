// src/components/3d/ARParallax.tsx - AR视差效果（让分子"立起来"）
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { DeviceMotion } from 'expo-sensors';
import * as THREE from 'three';

interface ARParallaxProps {
  enabled: boolean;
  targetGroup: THREE.Group | null;
  intensity?: number; // 效果强度 (0-1)
}

export const ARParallax: React.FC<ARParallaxProps> = ({ 
  enabled, 
  targetGroup,
  intensity = 0.7
}) => {
  const motionData = useRef({ 
    rotation: { alpha: 0, beta: 0, gamma: 0 },
    acceleration: { x: 0, y: 0, z: 0 }
  });
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  const initialPosition = useRef<THREE.Vector3 | null>(null);
  const initialRotation = useRef<THREE.Euler | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!enabled || !targetGroup) {
      if (!enabled) {
        console.log('AR效果未启用');
      }
      return;
    }

    // 保存初始位置和旋转（只初始化一次）
    if (!isInitialized.current) {
      initialPosition.current = targetGroup.position.clone();
      initialRotation.current = targetGroup.rotation.clone();
      isInitialized.current = true;
      console.log('✅ AR效果已初始化，初始位置:', initialPosition.current);
    }

    // 设置设备运动更新频率
    DeviceMotion.setUpdateInterval(16); // 约60fps

    console.log('🎬 开始监听设备运动传感器...');

    const subscription = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        motionData.current.rotation = {
          alpha: data.rotation.alpha || 0,
          beta: data.rotation.beta || 0,
          gamma: data.rotation.gamma || 0,
        };
        
        // 每秒打印一次调试信息（降低频率）
        if (Math.random() < 0.01) {
          console.log('📱 设备旋转:', {
            beta: data.rotation.beta?.toFixed(1),
            gamma: data.rotation.gamma?.toFixed(1)
          });
        }
      }

      if (data.acceleration) {
        motionData.current.acceleration = {
          x: data.acceleration.x || 0,
          y: data.acceleration.y || 0,
          z: data.acceleration.z || 0,
        };
      }

      // 计算视差偏移（根据手机倾斜角度）
      const beta = motionData.current.rotation.beta;  // 前后倾斜 (-180 到 180)
      const gamma = motionData.current.rotation.gamma; // 左右倾斜 (-90 到 90)

      // 极大地放大效果 - 让3度的倾斜也能产生明显效果
      const parallaxScale = intensity * 150; // 从30增加到150，放大5倍！
      const betaRad = (beta * Math.PI) / 180;
      const gammaRad = (gamma * Math.PI) / 180;

      // 计算目标位置（视差效果）- 超级明显的移动
      targetPosition.current.x = Math.sin(gammaRad) * parallaxScale;
      targetPosition.current.y = -Math.sin(betaRad) * parallaxScale;
      targetPosition.current.z = Math.cos(betaRad) * parallaxScale * 0.5;

      // 计算目标旋转（让分子随手机倾斜而倾斜）- 超级明显的旋转
      const rotationScale = intensity * 10.0; // 从2.0增加到10.0，放大5倍！
      targetRotation.current.x = betaRad * rotationScale;
      targetRotation.current.y = gammaRad * rotationScale;
      targetRotation.current.z = gammaRad * rotationScale * 0.5;
    });

    return () => {
      console.log('🛑 停止监听设备运动传感器');
      subscription.remove();
    };
  }, [enabled, targetGroup, intensity]);

  useFrame(() => {
    if (!enabled || !targetGroup || !initialPosition.current || !initialRotation.current) return;

    // 平滑插值（避免抖动）- 更快的响应
    const lerpFactor = 0.2; // 从0.15增加到0.2，响应更快

    // 位置插值
    targetGroup.position.x = THREE.MathUtils.lerp(
      targetGroup.position.x,
      initialPosition.current.x + targetPosition.current.x,
      lerpFactor
    );
    targetGroup.position.y = THREE.MathUtils.lerp(
      targetGroup.position.y,
      initialPosition.current.y + targetPosition.current.y,
      lerpFactor
    );
    targetGroup.position.z = THREE.MathUtils.lerp(
      targetGroup.position.z,
      initialPosition.current.z + targetPosition.current.z,
      lerpFactor
    );

    // 旋转插值
    targetGroup.rotation.x = THREE.MathUtils.lerp(
      targetGroup.rotation.x,
      initialRotation.current.x + targetRotation.current.x,
      lerpFactor
    );
    targetGroup.rotation.y = THREE.MathUtils.lerp(
      targetGroup.rotation.y,
      initialRotation.current.y + targetRotation.current.y,
      lerpFactor
    );
    targetGroup.rotation.z = THREE.MathUtils.lerp(
      targetGroup.rotation.z,
      initialRotation.current.z + targetRotation.current.z,
      lerpFactor
    );
  });

  return null;
};
