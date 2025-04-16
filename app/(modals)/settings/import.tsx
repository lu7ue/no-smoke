import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getDatabase } from '../../../database/initDB';

// 类型定义
type ImportData = {
    version: number;
    exportedAt: string;
    tables: {
        users: Array<{
            id: number;
            name: string;
            avatar?: string;
            created_at: string;
        }>;
        quit_dates: Array<{
            id: number;
            quit_date: string;
            created_at: string;
        }>;
        smoking_habits: Array<{
            id: number;
            price_per_cigarette: number;
            cigarettes_per_day: number;
            currency: 'CNY' | 'EUR';
            created_at: string;
        }>;
        goals: Array<{
            id: number;
            name: string;
            target_amount: number;
            created_at: string;
        }>;
        craving_records: Array<{
            id: number;
            timestamp: string;
            trigger: string;
            is_custom_trigger: boolean;
            created_at: string;
        }>;
    };
};

export default function ImportScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
            } else {
                throw new Error('未选择文件');
            }
        } catch (error) {
            Alert.alert('错误', error instanceof Error ? error.message : '选择文件失败');
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            Alert.alert('提示', '请先选择文件');
            return;
        }

        setIsLoading(true);
        try {
            // 1. 读取文件内容
            const jsonStr = await FileSystem.readAsStringAsync(selectedFile.uri);
            const data = JSON.parse(jsonStr) as ImportData;

            // 2. 验证数据格式
            if (!data.tables || !data.tables.users) {
                throw new Error('无效的导出文件格式');
            }

            // 3. 获取数据库实例
            const db = await getDatabase();

            // 4. 开始事务
            await db.execAsync('BEGIN TRANSACTION');

            try {
                // 5. 清空现有数据（保留表结构）
                await Promise.all([
                    db.execAsync('DELETE FROM users'),
                    db.execAsync('DELETE FROM quit_dates'),
                    db.execAsync('DELETE FROM smoking_habits'),
                    db.execAsync('DELETE FROM goals'),
                    db.execAsync('DELETE FROM craving_records'),
                ]);

                // 6. 导入数据（带类型检查）
                const { tables } = data;

                // 用户表
                if (tables.users.length > 0) {
                    await Promise.all(
                        tables.users.map((user: ImportData['tables']['users'][0]) =>
                            db.runAsync(
                                'INSERT INTO users (id, name, avatar, created_at) VALUES (?, ?, ?, ?)',
                                [user.id, user.name, user.avatar || null, user.created_at]
                            )
                        )
                    );
                }

                // 戒烟日期
                if (tables.quit_dates.length > 0) {
                    await Promise.all(
                        tables.quit_dates.map((date: ImportData['tables']['quit_dates'][0]) =>
                            db.runAsync(
                                'INSERT INTO quit_dates (id, quit_date, created_at) VALUES (?, ?, ?)',
                                [date.id, date.quit_date, date.created_at]
                            )
                        )
                    );
                }

                // 吸烟习惯
                if (tables.smoking_habits.length > 0) {
                    await Promise.all(
                        tables.smoking_habits.map((habit: ImportData['tables']['smoking_habits'][0]) =>
                            db.runAsync(
                                'INSERT INTO smoking_habits (id, price_per_cigarette, cigarettes_per_day, currency, created_at) VALUES (?, ?, ?, ?, ?)',
                                [
                                    habit.id,
                                    habit.price_per_cigarette,
                                    habit.cigarettes_per_day,
                                    habit.currency,
                                    habit.created_at,
                                ]
                            )
                        )
                    );
                }

                // 目标
                if (tables.goals.length > 0) {
                    await Promise.all(
                        tables.goals.map((goal: ImportData['tables']['goals'][0]) =>
                            db.runAsync(
                                'INSERT INTO goals (id, name, target_amount, created_at) VALUES (?, ?, ?, ?)',
                                [goal.id, goal.name, goal.target_amount, goal.created_at]
                            )
                        )
                    );
                }

                // 冲动记录
                if (tables.craving_records.length > 0) {
                    await Promise.all(
                        tables.craving_records.map((record: ImportData['tables']['craving_records'][0]) =>
                            db.runAsync(
                                'INSERT INTO craving_records (id, timestamp, trigger, is_custom_trigger, created_at) VALUES (?, ?, ?, ?, ?)',
                                [
                                    record.id,
                                    record.timestamp,
                                    record.trigger,
                                    record.is_custom_trigger ? 1 : 0,
                                    record.created_at,
                                ]
                            )
                        )
                    );
                }

                // 提交事务
                await db.execAsync('COMMIT');
                Alert.alert('导入成功', '所有数据已恢复');
                setSelectedFile(null);

            } catch (error) {
                // 回滚事务
                await db.execAsync('ROLLBACK');
                throw error;
            }

        } catch (error) {
            Alert.alert('导入失败', error instanceof Error ? error.message : '数据格式不正确');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="p-4">
            <TouchableOpacity
                onPress={pickFile}
                className="bg-blue-500 p-4 rounded-lg mb-4"
            >
                <Text className="text-white text-center">选择文件</Text>
            </TouchableOpacity>

            {selectedFile && (
                <View className="mb-4 p-3 bg-gray-100 rounded">
                    <Text className="text-gray-800">已选择: {selectedFile.name}</Text>
                </View>
            )}

            <TouchableOpacity
                onPress={handleImport}
                disabled={!selectedFile || isLoading}
                className={`p-4 rounded-lg ${(!selectedFile || isLoading) ? 'bg-gray-400' : 'bg-green-500'}`}
            >
                <Text className="text-white text-center">
                    {isLoading ? '正在导入...' : '开始导入'}
                </Text>
            </TouchableOpacity>

            <View className="mt-6 p-4 bg-yellow-100 rounded-lg">
                <Text className="font-bold text-yellow-800">注意：</Text>
                <Text></Text>
                <Text className="text-yellow-700">导入将覆盖现有所有数据</Text>
                <Text className="text-yellow-700">请确保文件来自本应用的导出</Text>
                <Text className="text-yellow-700">大文件导入可能需要较长时间</Text>
            </View>
        </View>
    );
}