// src/components/RadarChart.tsx - 五角雷达图组件
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
  data: number[];  // 5个数据点，范围 0-100
  labels: string[];  // 5个标签
  size?: number;  // 图表大小
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  labels, 
  size = 200 
}) => {
  const center = size / 2;
  const maxRadius = size / 2 - 40;  // 留出空间显示标签
  const levels = 5;  // 5个同心圆层级

  // 计算五角星的顶点位置
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;  // 从顶部开始
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // 计算标签位置
  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const radius = maxRadius + 25;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // 生成背景网格的五角形路径
  const getPolygonPoints = (level: number) => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const radius = (maxRadius * level) / levels;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // 生成数据多边形路径
  const getDataPolygonPoints = () => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const point = getPoint(i, data[i]);
      points.push(`${point.x},${point.y}`);
    }
    return points.join(' ');
  };

  // 根据数值获取颜色
  const getColor = (value: number) => {
    if (value >= 70) return '#4CAF50';  // 绿色
    if (value >= 40) return '#FFA726';  // 橙色
    return '#EF5350';  // 红色
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* 背景网格 - 5个同心五角形 */}
        {[...Array(levels)].map((_, i) => (
          <Polygon
            key={`grid-${i}`}
            points={getPolygonPoints(i + 1)}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="1"
          />
        ))}

        {/* 从中心到顶点的线 */}
        {[...Array(5)].map((_, i) => {
          const point = getPoint(i, 100);
          return (
            <Line
              key={`line-${i}`}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#E0E0E0"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据多边形 */}
        <Polygon
          points={getDataPolygonPoints()}
          fill="rgba(76, 175, 80, 0.3)"
          stroke="#4CAF50"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {data.map((value, i) => {
          const point = getPoint(i, value);
          return (
            <Circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={getColor(value)}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* 标签 */}
        {labels.map((label, i) => {
          const point = getLabelPoint(i);
          return (
            <SvgText
              key={`label-${i}`}
              x={point.x}
              y={point.y}
              fontSize="11"
              fontWeight="600"
              fill="#546E7A"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}

        {/* 中心点 */}
        <Circle cx={center} cy={center} r="3" fill="#4CAF50" />
      </Svg>

      {/* 数值显示 */}
      <View style={styles.valuesContainer}>
        {labels.map((label, i) => (
          <View key={i} style={styles.valueItem}>
            <View style={[styles.colorDot, { backgroundColor: getColor(data[i]) }]} />
            <Text style={styles.valueText}>
              {label}: {data[i].toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  valuesContainer: {
    marginTop: 16,
    width: '100%',
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  valueText: {
    fontSize: 12,
    color: '#546E7A',
  },
});
