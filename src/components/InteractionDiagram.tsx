// src/components/InteractionDiagram.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { InteractionDiagramData } from '../types/api';

interface Props {
    data: InteractionDiagramData;
    width?: number;
    height?: number;
}

export function InteractionDiagram({ data, width = 320, height = 220 }: Props) {
    if (!data?.nodes?.length) {
        return null;
    }

    const ligandNodes = data.nodes.filter(n => n.type === 'ligand');
    const residueNodes = data.nodes.filter(n => n.type === 'residue');

    return (
        <View style={[styles.container, { width, minHeight: height }]}>
            <Text style={styles.title}>相互作用图</Text>
            <View style={styles.diagramArea}>
                {/* 配体中心节点 */}
                <View style={styles.ligandCenter}>
                    <View style={[styles.node, styles.ligandNode]}>
                        <Text style={styles.ligandLabel}>配体</Text>
                    </View>
                </View>

                {/* 残基节点环状分布 */}
                <View style={styles.residueRing}>
                    {residueNodes.slice(0, 8).map((node, index) => {
                        const angle = (index / Math.min(residueNodes.length, 8)) * 2 * Math.PI - Math.PI / 2;
                        const radius = 70;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        return (
                            <View
                                key={node.id}
                                style={[
                                    styles.residueNodeWrapper,
                                    { transform: [{ translateX: x }, { translateY: y }] },
                                ]}
                            >
                                <View style={[styles.node, styles.residueNode, { backgroundColor: node.color || '#2196F3' }]}>
                                    <Text style={styles.residueLabel}>{node.label}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* 边/相互作用图例 */}
            <View style={styles.legend}>
                {data.edges?.slice(0, 6).map((edge, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendLine, { backgroundColor: edge.color || '#666' }]} />
                        <Text style={styles.legendText}>{edge.label || edge.type}</Text>
                    </View>
                ))}
            </View>

            {ligandNodes.length > 0 && (
                <Text style={styles.structureHint}>
                    配体结构: {data.ligandStructure || '已解析'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        alignSelf: 'center',
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    diagramArea: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    ligandCenter: {
        position: 'absolute',
        zIndex: 2,
    },
    residueRing: {
        position: 'absolute',
        width: 0,
        height: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    residueNodeWrapper: {
        position: 'absolute',
    },
    node: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        minWidth: 44,
        alignItems: 'center',
    },
    ligandNode: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    residueNode: {
        backgroundColor: '#2196F3',
    },
    ligandLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    residueLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 6,
        marginVertical: 3,
    },
    legendLine: {
        width: 16,
        height: 2,
        marginRight: 4,
    },
    legendText: {
        fontSize: 10,
        color: '#666',
    },
    structureHint: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginTop: 6,
    },
});

export default InteractionDiagram;