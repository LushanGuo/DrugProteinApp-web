import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Compound } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
    visible: boolean;
    compound: Compound | null;
    onClose: () => void;
}

export const CompoundDetailScreen: React.FC<Props> = ({ visible, compound, onClose }) => {
    if (!compound) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>化合物详情</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* ID Badge */}
                    <View style={styles.idContainer}>
                        <Text style={styles.idLabel}>ID</Text>
                        <Text style={styles.idValue}>#{compound.id.toString().padStart(3, '0')}</Text>
                    </View>

                    {/* 名称区域 */}
                    <View style={styles.nameSection}>
                        <MaterialCommunityIcons 
                            name="hexagon-multiple" 
                            size={48} 
                            color={theme.colors.primary} 
                            style={styles.icon}
                        />
                        <Text style={styles.name}>{compound.name}</Text>
                        <Text style={styles.englishName}>{compound.englishName}</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{compound.category}</Text>
                        </View>
                    </View>

                    {/* 理化性质 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>理化性质</Text>
                        <View style={styles.propertyGrid}>
                            <View style={styles.propertyCard}>
                                <MaterialCommunityIcons name="weight" size={24} color={theme.colors.primary} />
                                <Text style={styles.propertyLabel}>分子量</Text>
                                <Text style={styles.propertyValue}>{compound.molecularWeight}</Text>
                                <Text style={styles.propertyUnit}>g/mol</Text>
                            </View>
                            <View style={styles.propertyCard}>
                                <MaterialCommunityIcons name="water" size={24} color={theme.colors.primary} />
                                <Text style={styles.propertyLabel}>LogP</Text>
                                <Text style={styles.propertyValue}>{compound.logP}</Text>
                                <Text style={styles.propertyUnit}>亲脂性</Text>
                            </View>
                        </View>
                    </View>

                    {/* SMILES */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SMILES 结构式</Text>
                        <View style={styles.smilesContainer}>
                            <Text style={styles.smilesText} selectable>
                                {compound.smiles}
                            </Text>
                        </View>
                    </View>

                    {/* 描述 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>化合物描述</Text>
                        <Text style={styles.description}>{compound.description}</Text>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    idLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginRight: 8,
    },
    idValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    nameSection: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.l,
        padding: 24,
        marginBottom: 20,
        ...theme.shadows.soft,
    },
    icon: {
        marginBottom: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    englishName: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    propertyGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    propertyCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    propertyLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 8,
        marginBottom: 4,
    },
    propertyValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    propertyUnit: {
        fontSize: 11,
        color: theme.colors.text.light,
        marginTop: 2,
    },
    smilesContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    smilesText: {
        fontSize: 13,
        color: theme.colors.text.primary,
        fontFamily: 'monospace',
        lineHeight: 20,
    },
    description: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        lineHeight: 24,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        ...theme.shadows.soft,
    },
});
