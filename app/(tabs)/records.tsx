import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { addCravingRecord, getCravingRecords, getTriggerStats, getTimeDistribution, getDatabase } from '../../database/initDB';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { RectButton } from 'react-native-gesture-handler';

type CravingRecord = {
    id: number;
    timestamp: string;
    trigger: string;
    is_custom_trigger: boolean;
};

type TriggerStat = {
    trigger: string;
    count: number;
};

type TimeData = {
    hour: string;
    count: number;
};

const TRIGGER_OPTIONS = [
    "负面情绪",
    "社交",
    "吃饭前后",
    "尼古丁",
    "放松",
    "无聊",
    "思考",
    "其他"
];

const screenWidth = Dimensions.get('window').width;

export default function Records() {
    const [records, setRecords] = useState<CravingRecord[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTrigger, setSelectedTrigger] = useState('');
    const [customTrigger, setCustomTrigger] = useState('');
    const [triggerStats, setTriggerStats] = useState<TriggerStat[]>([]);
    const [timeDistribution, setTimeDistribution] = useState<TimeData[]>([]);
    const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
    const [isLoading, setIsLoading] = useState(false);

    const loadRecords = async () => {
        try {
            setIsLoading(true);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const records = await getCravingRecords(
                activeTab === 'today' ? today : undefined,
                activeTab === 'today' ? new Date() : undefined
            );
            setRecords(records || []);

            const triggers = await getTriggerStats();
            setTriggerStats(triggers || []);

            const timeData = await getTimeDistribution();
            console.log('原始时间分布数据:', timeData); // 调试日志
            setTimeDistribution(timeData || []);
        } catch (error) {
            console.error('加载记录失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [activeTab]);

    const handleAddRecord = async () => {
        try {
            const trigger = selectedTrigger === '其他' ? customTrigger : selectedTrigger;
            if (!trigger) return;

            await addCravingRecord({
                trigger,
                is_custom_trigger: selectedTrigger === '其他'
            });

            setSelectedTrigger('');
            setCustomTrigger('');
            setShowModal(false);
            await loadRecords();
        } catch (error) {
            console.error('添加记录失败:', error);
        }
    };

    const handleDeleteRecord = async (id: number) => {
        try {
            const db = await getDatabase();
            await db.runAsync('DELETE FROM craving_records WHERE id = ?', [id]);
            await loadRecords();
        } catch (error) {
            console.error('删除记录失败:', error);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // 准备时间分布数据（每2小时一个区间）
    const prepareTimeData = () => {
        const timeSlots = Array(12).fill(0).map((_, i) => ({
            label: `${i * 2}-${i * 2 + 2}`,
            count: 0
        }));

        timeDistribution.forEach((item) => {
            console.log('记录 hour 原始值:', item.hour); // 👈 看这里
            const hour = parseInt(item.hour);
            const slotIndex = Math.min(11, Math.floor(hour / 2));
            timeSlots[slotIndex].count += item.count || 0;
        });

        return {
            labels: timeSlots.map(slot => slot.label),
            data: timeSlots.map(slot => slot.count)
        };
    };

    const prepareTriggerData = () => {
        return triggerStats.map((item: TriggerStat, index: number) => ({
            name: item.trigger,
            population: item.count,
            color: getColorByIndex(index),
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
        }));
    };

    const getColorByIndex = (index: number) => {
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC24A', '#607D8B'];
        return colors[index % colors.length];
    };

    const { labels: timeLabels, data: timeData } = prepareTimeData();
    const pieData = prepareTriggerData();

    const renderRightActions = (id: number) => {
        return (
            <RectButton
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    marginVertical: 5
                }}
                onPress={() => handleDeleteRecord(id)}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>删除</Text>
            </RectButton>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView className="flex-1 bg-gray-50 p-4">
                {/* 记录按钮 */}
                <TouchableOpacity
                    className="bg-blue-500 py-3 rounded-lg mb-6"
                    onPress={() => setShowModal(true)}
                >
                    <Text className="text-white text-center font-bold text-lg">记录一次冲动</Text>
                </TouchableOpacity>

                {/* 标签切换 */}
                <View className="flex-row bg-gray-200 rounded-lg mb-6 overflow-hidden">
                    <TouchableOpacity
                        className={`flex-1 py-2 ${activeTab === 'today' ? 'bg-blue-500' : ''}`}
                        onPress={() => setActiveTab('today')}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'today' ? 'text-white' : 'text-gray-700'}`}>
                            今日
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-2 ${activeTab === 'all' ? 'bg-blue-500' : ''}`}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'all' ? 'text-white' : 'text-gray-700'}`}>
                            全部
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 只在今日标签显示最近记录 */}
                {activeTab === 'today' && (
                    <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                        <Text className="text-lg font-bold mb-3 text-gray-800">最近记录</Text>
                        {isLoading ? (
                            <Text className="text-gray-500 text-center py-4">加载中...</Text>
                        ) : records.length === 0 ? (
                            <Text className="text-gray-500 text-center py-4">暂无记录</Text>
                        ) : (
                            <>
                                {records.slice(0, 3).map((record: CravingRecord) => (
                                    <Swipeable
                                        key={record.id}
                                        renderRightActions={() => renderRightActions(record.id)}
                                        containerStyle={{ borderRadius: 10, overflow: 'hidden' }}
                                    >
                                        <View className="flex-row justify-between py-3 px-4 bg-white">
                                            <Text className="text-gray-600">{formatTime(record.timestamp)}</Text>
                                            <Text className="font-medium text-gray-800">{record.trigger}</Text>
                                        </View>
                                    </Swipeable>
                                ))}
                            </>
                        )}
                    </View>
                )}

                {/* 时间分布热力图 */}
                {/* 时间分布热力图 */}
                <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                    <Text className="text-lg font-bold mb-3 text-gray-800">时间分布/次数</Text>
                    {timeData.some(count => count > 0) ? (
                        <View className="flex-row flex-wrap justify-between">
                            {timeLabels.map((time, index) => (
                                <View key={time} className="items-center mb-2" style={{ width: `${100 / 6}%` }}>
                                    <View
                                        className="rounded-sm bg-gray-100 justify-center items-center"
                                        style={{
                                            height: 30,
                                            width: '90%',
                                            borderWidth: 1,
                                            borderColor: '#ccc'
                                        }}
                                    >
                                        <Text className="text-sm font-medium text-gray-800">
                                            {timeData[index]}
                                        </Text>
                                    </View>
                                    <Text className="text-xs mt-1 text-gray-600">{time}</Text>
                                </View>
                            ))}
                            <View className="w-full flex-row justify-between mt-2">
                                <Text className="text-xs text-gray-500"></Text>
                                <Text className="text-xs text-gray-500">峰值: {Math.max(...timeData)}次</Text>
                            </View>
                        </View>
                    ) : (
                        <Text className="text-gray-500 text-center py-4">暂无数据</Text>
                    )}
                </View>


                {/* 诱因分析 */}
                <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                    <Text className="text-lg font-bold mb-3 text-gray-800">诱因分析</Text>
                    {pieData.length > 0 ? (
                        <View className="items-center">
                            <PieChart
                                data={pieData}
                                width={screenWidth - 32}
                                height={200}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        </View>
                    ) : (
                        <Text className="text-gray-500 text-center py-4">暂无数据</Text>
                    )}
                </View>

                {/* 添加记录模态框 */}
                <Modal
                    visible={showModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowModal(false)}
                >
                    <View className="flex-1 justify-center items-center bg-black/50">
                        <View className="bg-white w-11/12 rounded-lg p-5">
                            <Text className="text-xl font-bold mb-4 text-center text-gray-800">记录冲动</Text>

                            <Text className="text-gray-700 mb-2">选择诱因</Text>
                            <View className="flex-row flex-wrap mb-4">
                                {TRIGGER_OPTIONS.map(trigger => (
                                    <TouchableOpacity
                                        key={trigger}
                                        className={`py-2 px-3 rounded-full m-1 ${selectedTrigger === trigger ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        onPress={() => setSelectedTrigger(trigger)}
                                    >
                                        <Text className={`${selectedTrigger === trigger ? 'text-white' : 'text-gray-800'}`}>
                                            {trigger}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedTrigger === '其他' && (
                                <>
                                    <Text className="text-gray-700 mb-2">自定义诱因</Text>
                                    <TextInput
                                        className="border border-gray-300 rounded p-2 mb-4"
                                        placeholder="请输入诱因"
                                        value={customTrigger}
                                        onChangeText={setCustomTrigger}
                                    />
                                </>
                            )}

                            <View className="flex-row justify-between mt-4">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-200 py-2 rounded mr-2"
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text className="text-center text-gray-800">取消</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded ml-2 ${(!selectedTrigger || (selectedTrigger === '其他' && !customTrigger)) ? 'bg-blue-300' : 'bg-blue-500'}`}
                                    onPress={handleAddRecord}
                                    disabled={!selectedTrigger || (selectedTrigger === '其他' && !customTrigger)}
                                >
                                    <Text className="text-center text-white">确认</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </GestureHandlerRootView>
    );
}