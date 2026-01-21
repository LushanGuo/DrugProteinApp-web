/**
 * 评分接口测试脚本 v2.0 - 支持熔断机制
 * 使用方法：node test-scoring-api.js
 */

const axios = require('axios');

// 修改为你的 API 地址
const API_BASE_URL = 'http://192.168.3.254:8080/api';

console.log('🧪 开始测试评分接口 v2.0...');
console.log('📡 API 地址:', API_BASE_URL);
console.log('');

// 测试：计算化合物评分
async function testCalculateScore(compoundId) {
    try {
        console.log(`测试: 计算化合物评分 (ID: ${compoundId})`);
        const response = await axios.post(`${API_BASE_URL}/analysis/${compoundId}/calculate`);
        
        const data = response.data;
        
        console.log('✅ 成功！评分结果:');
        console.log('  - 化合物ID:', data.compoundId);
        console.log('  - 总评分:', data.totalScore);
        console.log('  - 效能评分 (45%):', data.potencyScore);
        console.log('  - 安全评分 (35%):', data.safetyScore);
        console.log('  - 成药性评分 (20%):', data.druglikenessScore);
        console.log('  - 是否熔断:', data.isVetoed ? '⛔ 是' : '✅ 否');
        console.log('  - 智能标签:', data.adviceTags.join(', '));
        console.log('  - 专家建议:');
        console.log('    ' + data.expertAdvice.split('\n').join('\n    '));
        console.log('');
        
        return { success: true, vetoed: data.isVetoed };
    } catch (error) {
        console.log('❌ 失败:', error.message);
        if (error.response) {
            console.log('  响应状态:', error.response.status);
            console.log('  响应数据:', error.response.data);
        }
        console.log('');
        return { success: false, vetoed: false };
    }
}

// 运行测试
async function runTests() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 新版评分算法特性:');
    console.log('  1. 三维评分体系: 效能(45%) + 安全(35%) + 成药性(20%)');
    console.log('  2. 熔断机制: hERG > 0.7 触发一票否决');
    console.log('  3. 智能标签: 自动生成优缺点标签');
    console.log('  4. AI 建议: 基于评分的专业建议');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // 测试正常化合物
    console.log('【测试1】正常化合物评分:');
    const result1 = await testCalculateScore(1);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试结果汇总:');
    console.log(`  通过: ${result1.success ? '✅' : '❌'}`);
    console.log(`  熔断: ${result1.vetoed ? '⛔ 是' : '✅ 否'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result1.success) {
        console.log('🎉 评分接口工作正常！');
        console.log('');
        console.log('💡 前端展示说明:');
        console.log('  - 正常评分: 显示圆形进度条 + 三维得分卡片');
        console.log('  - 熔断状态: 显示红色警告页面 + 0分');
        console.log('  - 智能标签: 蓝色标签展示优缺点');
        console.log('  - AI建议: 黄色卡片展示专家建议');
        console.log('');
        console.log('🚀 测试熔断机制:');
        console.log('  修改后端 ScoringService.java 中的 mockHergProb = 0.8');
        console.log('  重启后端，再次测试即可看到熔断效果');
    } else {
        console.log('⚠️  评分接口测试失败，请检查:');
        console.log('  1. 后端服务是否启动');
        console.log('  2. API 地址是否正确');
        console.log('  3. 化合物ID是否存在');
        console.log('  4. 后端是否已更新为新版算法');
    }
}

runTests();
