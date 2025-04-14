import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import quote from '../../assets/quote.json';
import { getDatabase, getQuitDate, getSmokingHabits, getGoal } from '../../database/initDB';
import { useRouter, useFocusEffect } from 'expo-router';
import { SmokingHabits, Goal } from '../../database/types';

export default function Index() {
    const router = useRouter();
    const [randomQuote, setRandomQuote] = useState('');
    const [quitDuration, setQuitDuration] = useState('');
    const [quitDate, setQuitDate] = useState<Date | null>(null);
    const [savedAmount, setSavedAmount] = useState(0);
    const [habits, setHabits] = useState<SmokingHabits | null>(null);
    const [goal, setGoal] = useState<Goal | null>(null);

    const loadMoneyData = async () => {
        try {
            const date = await getQuitDate();
            if (!date) return;

            const habits = await getSmokingHabits();
            const goal = await getGoal();

            if (habits) {
                setHabits(habits);
                const now = new Date();
                const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                const amount = days * habits.cigarettes_per_day * habits.price_per_cigarette;
                setSavedAmount(amount);
            }

            if (goal && goal.name) {
                setGoal(goal);
            }
        } catch (error) {
            console.error('加载省钱数据失败:', error);
        }
    };

    // 计算戒烟时长
    const calculateDuration = (quitDate: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - quitDate.getTime();

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setQuitDuration(`${days}天 ${hours}小时 ${minutes}分钟`);
    };

    // 加载戒烟日期和计算时长
    const loadQuitData = async () => {
        try {
            const date = await getQuitDate();
            // 数据库初始化确保date永远不会为null
            setQuitDate(date as Date);
            calculateDuration(date as Date);
        } catch (error) {
            console.error('加载戒烟日期失败:', error);
            // 即使出错也使用当前时间
            const currentDate = new Date();
            setQuitDate(currentDate);
            calculateDuration(currentDate);
        }
    };

    // 使用 useFocusEffect 加载戒烟和金钱数据
    useFocusEffect(
        React.useCallback(() => {
            loadQuitData();
            loadMoneyData();
        }, [])
    );

    // 使用 useEffect 初始化应用
    useEffect(() => {
        const initApp = async () => {
            try {
                await getDatabase(); // 初始化数据库
                await loadQuitData(); // 加载戒烟数据

                // 设置随机激励语句
                if (quote && quote.length > 0) {
                    const randomIndex = Math.floor(Math.random() * quote.length);
                    setRandomQuote(quote[randomIndex]);
                }
            } catch (error) {
                console.error('初始化失败:', error);
            }
        };

        initApp();
    }, []);

    return (
        <ScrollView className="flex-1">
            {/* 激励语句 */}
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                paddingHorizontal: 0,
                paddingVertical: 0
            }}>
                <Text className="text-gray-900 font-bold text-2xl" style={{
                    marginTop: 20,
                    paddingLeft: 10,
                }}>
                    坚持一下
                </Text>

                <View style={{
                    marginTop: 6,
                    marginBottom: 20,
                    backgroundColor: 'white',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    marginHorizontal: 10,
                }}>
                    <Text className="text-gray-700 text-lg" style={{ textAlign: 'left' }}>
                        {randomQuote}
                    </Text>
                </View>
            </View>

            {/* 分割线 */}
            <View className='bg-white'>
                <View style={{
                    height: 1.5,
                    backgroundColor: '#d1d5db',
                    marginHorizontal: 20,
                    marginBottom: 20
                }} />
            </View>

            {/* 戒烟进度 */}
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                paddingHorizontal: 0,
                paddingVertical: 0
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: 10,
                }}>
                    <Text className="text-gray-900 font-bold text-2xl" style={{
                        marginTop: 20,
                    }}>
                        戒烟进度
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(modals)/settings/date')}
                        style={{ marginRight: 10, marginTop: 20 }}
                    >
                        <Text className="text-blue-500 text-sm">设置</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    marginTop: 6,
                    marginBottom: 20,
                    backgroundColor: 'white',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    marginHorizontal: 10,
                }}>
                    {quitDate ? (
                        <>
                            <Text className="text-gray-700 text-lg" style={{ textAlign: 'left', marginBottom: 8 }}>
                                开始日期: {quitDate.toLocaleDateString('zh-CN')}
                            </Text>
                            <Text className="text-green-600 text-lg" style={{ textAlign: 'left' }}>
                                已坚持: {quitDuration}
                            </Text>
                        </>
                    ) : (
                        <Text className="text-gray-700 text-lg" style={{ textAlign: 'left' }}>
                            您还未设置戒烟时间
                        </Text>
                    )}
                </View>
            </View>

            {/* 分割线 */}
            <View className="bg-white">
                <View style={{
                    height: 1.5,
                    backgroundColor: '#d1d5db',
                    marginHorizontal: 20,
                    marginBottom: 20
                }} />
            </View>

            {/* 省钱进度 */}
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                paddingHorizontal: 0,
                paddingVertical: 0
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: 10,
                }}>
                    <Text className="text-gray-900 font-bold text-2xl" style={{
                        marginTop: 20,
                    }}>
                        省钱进度
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(modals)/settings/money')}
                        style={{ marginRight: 10, marginTop: 20 }}
                    >
                        <Text className="text-blue-500 text-sm">设置</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    marginTop: 6,
                    marginBottom: 20,
                    backgroundColor: 'white',
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    marginHorizontal: 10,
                }}>
                    {habits && (
                        <>
                            <Text className="text-gray-700 text-lg" style={{ textAlign: 'left', marginBottom: 8 }}>
                                已节省: {savedAmount.toFixed(2)} {habits.currency}
                            </Text>
                            {goal && (
                                <>
                                    <Text className="text-gray-700 text-lg mb-2">
                                        目标: {goal.name}
                                    </Text>

                                    <View className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                        <View
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${Math.min(100, (savedAmount / goal.target_amount) * 100)}%` }}
                                        ></View>
                                    </View>

                                    <View className="flex-row justify-between items-center mb-4">
                                        <Text className="text-gray-700 text-lg">
                                            {savedAmount >= goal.target_amount
                                                ? '已完成'
                                                : `${savedAmount.toFixed(2)} / ${goal.target_amount} ${habits.currency}`}
                                        </Text>
                                        <Text className="text-gray-700 text-lg">
                                            {Math.min(100, (savedAmount / goal.target_amount) * 100).toFixed(0)}%
                                        </Text>
                                    </View>
                                </>
                            )}
                        </>
                    )}
                </View>
            </View>

            {/* 分割线 */}
            <View className="bg-white">
                <View style={{
                    height: 1.5,
                    backgroundColor: '#d1d5db',
                    marginHorizontal: 20,
                    marginBottom: 20
                }} />
            </View>
        </ScrollView>
    );
}