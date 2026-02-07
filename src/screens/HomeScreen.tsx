// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    ActivityIndicator, ScrollView, TouchableOpacity, StatusBar, Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Compound, RootStackParamList } from '../types';
import { compoundAPI, authAPI } from '../services/api';
import { CompoundCard } from '../components/CompoundCard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
interface Props {
    navigation: HomeScreenNavigationProp;
}

const CATEGORIES = ['全部', '黄酮类', '生物碱类', '木脂素类', '香豆素类', '蒽醌类'];

export default function HomeScreen({ navigation }: Props) {
    const [compounds, setCompounds] = useState<Compound[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // 使用后端分页接口获取化合物列表
            const response = await compoundAPI.getList(0, 100); // 获取前100条
            setCompounds(response.data.content);
        } catch (e) {
            console.error('加载失败:', e);
            // 实际项目中可添加 Toast 提示
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            '退出登录',
            '确定要退出当前账号吗？',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '退出',
                    style: 'destructive',
                    onPress: async () => {
                        await authAPI.logout();
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    // 内存中过滤，保证极速响应
    const filteredData = useMemo(() => {
        return compounds.filter(item => {
            const matchSearch = item.name.includes(searchText) ||
                item.englishName.toLowerCase().includes(searchText.toLowerCase());
            const matchCategory = selectedCategory === '全部' || item.category === selectedCategory;
            return matchSearch && matchCategory;
        });
    }, [compounds, searchText, selectedCategory]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* 1. 顶部 Header */}
            <View style={styles.headerBg}>
                <View style={styles.headerContent}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.appTitle}>乳腺癌药物筛选平台</Text>
                        <Text style={styles.appSubtitle}>Target: CDK2 / 1e9h</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{compounds.length}</Text>
                        <Text style={styles.countLabel}>分子库</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="logout" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. 悬浮搜索栏 */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={theme.colors.primary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="搜索化合物名称 (中/英)..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#CCC" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* 3. 分类筛选 */}
            <View style={{ height: 50 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 4. 列表区域 */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10, color: '#888' }}>正在加载分子库...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CompoundCard
                            item={item}
                            onPress={() => navigation.navigate('Detail', { compound: item })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#CFD8DC" />
                            <Text style={{ color: '#999', marginTop: 10 }}>未找到匹配结果</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerBg: {
        backgroundColor: theme.colors.primary,
        paddingTop: 50, paddingBottom: 40, paddingHorizontal: 20,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    appTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    appSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    countBadge: { 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.1)', 
        padding: 8, 
        borderRadius: 8,
        marginRight: 12,
    },
    countText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    countLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    searchWrapper: { marginTop: -25, paddingHorizontal: 20, marginBottom: 10 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        height: 50, borderRadius: 12, paddingHorizontal: 15, ...theme.shadows.strong
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
    filterScroll: { paddingHorizontal: 20, alignItems: 'center' },
    chip: {
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
        backgroundColor: 'white', marginRight: 10, borderWidth: 1, borderColor: '#EEE'
    },
    chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 13, color: theme.colors.text.secondary },
    chipTextActive: { color: 'white', fontWeight: 'bold' },
    listContent: { padding: 20, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
});