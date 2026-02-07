// src/components/CompoundCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Compound } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
    item: Compound;
    onPress: () => void;
}

export const CompoundCard: React.FC<Props> = ({ item, onPress }) => {
    // 模拟状态 (如果后端还没返回 status 字段，默认为 PENDING)
    // const status = item.status || 'PENDING';
    const status = 'PENDING'; // 临时固定值，等待后端添加 status 字段

    // 获取状态对应的颜色和文字
    const getStatusConfig = (s: string) => {
        switch (s) {
            case 'COMPLETED': return { color: theme.colors.status.success, text: '已完成' };
            case 'PROCESSING': return { color: theme.colors.status.processing, text: '计算中' };
            case 'FAILED': return { color: theme.colors.status.failure, text: '失败' };
            default: return { color: theme.colors.status.pending, text: '待计算' };
        }
    };

    const config = getStatusConfig(status);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {/* 左侧：图标区 */}
            <View style={styles.leftSection}>
                <MaterialCommunityIcons name="hexagon-multiple" size={28} color={theme.colors.primary} style={{ opacity: 0.8 }} />
                <Text style={styles.idText}>#{item.id}</Text>
            </View>

            {/* 右侧：信息区 */}
            <View style={styles.rightSection}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.englishName} numberOfLines={1}>{item.englishName}</Text>
                    </View>

                    {/* 状态胶囊标签 */}
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                        <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 底部属性栏 */}
                <View style={styles.statsRow}>
                    <Text style={styles.statText}>MW: {item.molecularWeight}</Text>
                    <Text style={styles.statText}>LogP: {item.logP}</Text>
                    <Text style={[styles.statText, { color: theme.colors.primary }]}>{item.category}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        marginBottom: 12,
        ...theme.shadows.card,
        overflow: 'hidden',
    },
    leftSection: {
        width: 60,
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
    },
    idText: {
        fontSize: 10,
        color: theme.colors.text.light,
        marginTop: 4,
        fontWeight: 'bold',
    },
    rightSection: {
        flex: 1,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    englishName: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginVertical: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
});