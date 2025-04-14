import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import status from '../../../assets/status.json';
import { HealthStatus } from '../../../database/types';

const Info = () => {
    const statusData: HealthStatus[] = status as HealthStatus[];

    // 将分钟转换为更易读的时间格式
    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}分钟`;
        } else if (minutes < 1440) { // 小于1天
            const hours = Math.floor(minutes / 60);
            return `${hours}小时`;
        } else if (minutes < 10080) { // 小于1周
            const days = Math.floor(minutes / 1440);
            return `${days}天`;
        } else if (minutes < 43200) { // 小于1个月(30天)
            const weeks = Math.floor(minutes / 10080);
            return `${weeks}周`;
        } else if (minutes < 525600) { // 小于1年
            const months = Math.floor(minutes / 43200);
            return `${months}个月`;
        } else {
            const years = Math.floor(minutes / 525600);
            return `${years}年`;
        }
    };

    return (
        <ScrollView className="flex-1 bg-white p-4">
            {/* 标题部分 */}
            <View className="mt-4 mb-6">
                <Text className="text-base text-gray-600 text-center">
                    以下是戒烟后不同时间段身体会发生的积极变化。每一个不吸烟的日子，你的身体都在变得更好。
                </Text>
            </View>

            {/* 表格部分 */}
            <View className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                {/* 表头 */}
                <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                    <View className="w-1/4">
                        <Text className="font-bold text-gray-700">时间</Text>
                    </View>
                    <View className="w-3/4">
                        <Text className="font-bold text-gray-700">身体变化</Text>
                    </View>
                </View>

                {/* 表格内容 */}
                {statusData.map((item, index) => (
                    <View
                        key={index}
                        className={`flex-row p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                        <View className="w-1/4">
                            <Text className="text-gray-800">
                                {formatDuration(item.duration_minutes)}
                            </Text>
                        </View>
                        <View className="w-3/4">
                            <Text className="font-semibold text-gray-800 mb-1">
                                {item.title}
                            </Text>
                            <Text className="text-gray-600 text-sm">
                                {item.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default Info;