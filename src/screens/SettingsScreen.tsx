import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { setCustomIP, config, currentEnvironment } from '../config';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ visible, onClose }) => {
    const [ipAddress, setIpAddress] = useState('');

    const handleSave = () => {
        if (!ipAddress.trim()) {
            Alert.alert('提示', '请输入有效的 IP 地址');
            return;
        }

        // 验证 IP 格式（支持 localhost）
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipAddress !== 'localhost' && !ipPattern.test(ipAddress)) {
            Alert.alert('错误', 'IP 地址格式不正确\n示例: 192.168.1.100');
            return;
        }

        setCustomIP(ipAddress);
        Alert.alert(
            '设置成功',
            `API 地址已更新为:\nhttp://${ipAddress}:8080/api\n\n请重启应用使设置生效`,
            [
                {
                    text: '确定',
                    onPress: onClose,
                },
            ]
        );
    };

    const presetIPs = [
        { label: 'Android 模拟器', value: '10.0.2.2' },
        { label: 'iOS 模拟器', value: 'localhost' },
    ];

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
                    <Text style={styles.headerTitle}>设置</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.content}>
                    {/* 当前配置 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>当前配置</Text>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>环境: {currentEnvironment}</Text>
                            <Text style={styles.infoText}>{config.apiBaseUrl}</Text>
                        </View>
                    </View>

                    {/* 自定义 IP */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>自定义服务器 IP</Text>
                        <Text style={styles.description}>
                            如果使用真机测试，请输入你的电脑 IP 地址
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="例如: 192.168.1.100"
                            placeholderTextColor="#90A4AE"
                            value={ipAddress}
                            onChangeText={setIpAddress}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>保存设置</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 预设选项 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>快速选择</Text>
                        {presetIPs.map((preset) => (
                            <TouchableOpacity
                                key={preset.value}
                                style={styles.presetItem}
                                onPress={() => setIpAddress(preset.value)}
                            >
                                <Text style={styles.presetLabel}>{preset.label}</Text>
                                <Text style={styles.presetValue}>{preset.value}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 帮助信息 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>如何查找电脑 IP？</Text>
                        <View style={styles.helpBox}>
                            <Text style={styles.helpText}>
                                <Text style={styles.bold}>Windows:</Text>{'\n'}
                                打开命令提示符，输入 ipconfig{'\n\n'}
                                <Text style={styles.bold}>Mac/Linux:</Text>{'\n'}
                                打开终端，输入 ifconfig 或 ip addr
                            </Text>
                        </View>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 12,
        lineHeight: 20,
    },
    infoBox: {
        backgroundColor: '#E8F5E9',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontFamily: 'monospace',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        fontSize: 16,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.m,
        padding: 16,
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    presetItem: {
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    presetLabel: {
        fontSize: 15,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    presetValue: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontFamily: 'monospace',
    },
    helpBox: {
        backgroundColor: '#FFF3E0',
        borderRadius: theme.borderRadius.m,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    helpText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 22,
    },
    bold: {
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
});
