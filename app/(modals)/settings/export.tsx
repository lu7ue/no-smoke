import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getDatabase } from '../../../database/initDB';

export default function ExportScreen() {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const db = await getDatabase();

            // 查询所有表数据
            const [
                users,
                quitDates,
                smokingHabits,
                goals,
                cravingRecords
            ] = await Promise.all([
                db.getAllAsync('SELECT * FROM users'),
                db.getAllAsync('SELECT * FROM quit_dates'),
                db.getAllAsync('SELECT * FROM smoking_habits'),
                db.getAllAsync('SELECT * FROM goals'),
                db.getAllAsync('SELECT * FROM craving_records')
            ]);

            // 构建导出数据对象
            const exportData = {
                version: 1,
                exportedAt: new Date().toISOString(),
                tables: {
                    users,
                    quit_dates: quitDates,
                    smoking_habits: smokingHabits,
                    goals,
                    craving_records: cravingRecords
                }
            };

            // 生成JSON文件
            const jsonStr = JSON.stringify(exportData, null, 2);
            const fileUri = `${FileSystem.cacheDirectory}nosmoke_export_${Date.now()}.json`;
            await FileSystem.writeAsStringAsync(fileUri, jsonStr);

            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error('导出失败', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="p-4">
            <TouchableOpacity
                onPress={handleExport}
                disabled={isLoading}
                className={`p-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
            >
                <Text className="text-white text-center">
                    {isLoading ? '正在导出...' : '一键导出'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}