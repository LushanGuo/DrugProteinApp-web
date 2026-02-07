// src/theme.ts
export const theme = {
    colors: {
        primary: '#00695C',    // 主色：深青色 (代表医疗/科研)
        secondary: '#4DB6AC',  // 辅色：浅青
        background: '#F5F7FA', // 背景：极淡的灰蓝，护眼
        surface: '#FFFFFF',    // 卡片背景：纯白
        text: {
            primary: '#263238',  // 正文：深灰
            secondary: '#546E7A',// 副文：蓝灰
            light: '#B0BEC5',    // 提示文：浅灰
        },
        // 任务状态色 (对应 Vina 计算状态)
        status: {
            pending: '#78909C',    // 待计算 (灰)
            processing: '#FFA726', // 计算中 (橙)
            success: '#66BB6A',    // 成功 (绿)
            failure: '#EF5350',    // 失败 (红)
        }
    },
    spacing: { s: 8, m: 16, l: 24, xl: 32 },
    borderRadius: { s: 8, m: 12, l: 24 },
    shadows: {
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3, // Android 阴影
        },
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        strong: {
            shadowColor: '#004D40',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
        }
    }
};