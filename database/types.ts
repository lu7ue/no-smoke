// 定义吸烟习惯的接口
export interface SmokingHabits {
    id: number;
    price_per_cigarette: number; // 每根烟的价格
    cigarettes_per_day: number;   // 每天吸烟数量
    currency: 'CNY' | 'EUR';      // 货币单位
    created_at: string;           // 创建时间戳
}

// 定义目标的接口
export interface Goal {
    id: number;
    name: string;                 // 目标名称
    target_amount: number;        // 目标金额
    created_at: string;           // 创建时间戳
}

// 定义健康状态的接口
export interface HealthStatus {
    duration_minutes: number;
    title: string;
    description: string;
}