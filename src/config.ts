/**
 * 应用配置文件
 * 根据不同环境配置不同的 API 地址
 */

// 环境类型
type Environment = 'development' | 'production' | 'local' | 'custom';

// ⚠️ 修改这里切换环境
// - 'development': Android 模拟器
// - 'local': iOS 模拟器或本机
// - 'custom': 真机测试（需要修改下面的 IP）
// - 'production': 生产环境
const CURRENT_ENV: Environment = 'custom';

// 🔧 真机测试时，修改这里的 IP 为你的电脑局域网 IP
// Windows: 打开 cmd 输入 ipconfig，查看 IPv4 地址
// Mac/Linux: 打开终端输入 ifconfig 或 ip addr
const YOUR_COMPUTER_IP = '192.168.3.254';  // 👈 修改这里

// 不同环境的配置
const configs = {
    // iOS 模拟器或本机开发
    local: {
        apiBaseUrl: 'http://localhost:8080/api',
        timeout: 10000,
    },
    
    // Android 模拟器开发
    development: {
        apiBaseUrl: 'http://10.0.2.2:8080/api',
        timeout: 10000,
    },
    
    // 真机测试（使用电脑局域网 IP）
    custom: {
        apiBaseUrl: `http://${YOUR_COMPUTER_IP}:8080/api`,
        timeout: 10000,
    },
    
    // 生产环境
    production: {
        apiBaseUrl: 'https://your-production-server.com/api',
        timeout: 15000,
    },
};

// 导出当前环境的配置
export const config = configs[CURRENT_ENV];

// 导出环境信息
export const currentEnvironment = CURRENT_ENV;
export const isDevelopment = (CURRENT_ENV as string) === 'development';
export const isProduction = (CURRENT_ENV as string) === 'production';

// 动态设置 IP（用于设置页面）
export const setCustomIP = (ip: string) => {
    if (!isProduction) {
        config.apiBaseUrl = `http://${ip}:8080/api`;
        console.log('API地址已更新为:', config.apiBaseUrl);
    }
};

// 打印当前配置（方便调试）
console.log('当前环境:', CURRENT_ENV);
console.log('API地址:', config.apiBaseUrl);
