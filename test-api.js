/**
 * API 连接测试脚本
 * 使用方法：node test-api.js
 */

const axios = require('axios');

// 修改为你的 API 地址
const API_BASE_URL = 'http://192.168.3.254:8080/api';

console.log('🔍 开始测试 API 连接...');
console.log('📡 API 地址:', API_BASE_URL);
console.log('');

// 测试1: 获取化合物列表
async function testGetList() {
    try {
        console.log('测试1: 获取化合物列表');
        const response = await axios.get(`${API_BASE_URL}/compounds`, {
            params: { page: 0, size: 5 }
        });
        console.log('✅ 成功！返回数据:');
        console.log('  - 总数量:', response.data.totalElements);
        console.log('  - 总页数:', response.data.totalPages);
        console.log('  - 当前页:', response.data.pageable.pageNumber);
        console.log('  - 数据条数:', response.data.content.length);
        if (response.data.content.length > 0) {
            console.log('  - 第一条:', response.data.content[0].name);
        }
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ 失败:', error.message);
        console.log('');
        return false;
    }
}

// 测试2: 搜索化合物
async function testSearch() {
    try {
        console.log('测试2: 搜索化合物（关键词: 槲皮素）');
        const response = await axios.get(`${API_BASE_URL}/compounds`, {
            params: { keyword: '槲皮素' }
        });
        console.log('✅ 成功！搜索结果:');
        console.log('  - 匹配数量:', response.data.totalElements);
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ 失败:', error.message);
        console.log('');
        return false;
    }
}

// 测试3: 获取化合物详情
async function testGetDetail() {
    try {
        console.log('测试3: 获取化合物详情（ID: 1）');
        const response = await axios.get(`${API_BASE_URL}/compounds/1`);
        console.log('✅ 成功！化合物信息:');
        console.log('  - ID:', response.data.id);
        console.log('  - 中文名:', response.data.name);
        console.log('  - 英文名:', response.data.englishName);
        console.log('  - 分类:', response.data.category);
        console.log('');
        return true;
    } catch (error) {
        console.log('❌ 失败:', error.message);
        console.log('');
        return false;
    }
}

// 运行所有测试
async function runTests() {
    const results = [];
    
    results.push(await testGetList());
    results.push(await testSearch());
    results.push(await testGetDetail());
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试结果汇总:');
    console.log(`  通过: ${results.filter(r => r).length}/${results.length}`);
    console.log(`  失败: ${results.filter(r => !r).length}/${results.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (results.every(r => r)) {
        console.log('🎉 所有测试通过！API 连接正常！');
    } else {
        console.log('⚠️  部分测试失败，请检查:');
        console.log('  1. 后端服务是否启动');
        console.log('  2. API 地址是否正确');
        console.log('  3. 防火墙设置');
    }
}

runTests();
