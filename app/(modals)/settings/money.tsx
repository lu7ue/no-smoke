import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useFocusEffect } from 'expo-router';
import {
    getQuitDate,
    saveSmokingHabits,
    getSmokingHabits,
    saveGoal,
    getGoal
} from '../../../database/initDB';
import { getDatabase } from '../../../database/initDB';

const Money = () => {
    const router = useRouter();
    const [quitDate, setQuitDate] = useState<Date | null>(null);
    const [habits, setHabits] = useState({
        pricePerCigarette: '',
        cigarettesPerDay: '',
        currency: 'CNY' as 'CNY' | 'EUR'
    });
    const [goal, setGoal] = useState({
        name: '',
        targetAmount: ''
    });
    const [hasGoal, setHasGoal] = useState(false);
    const [loading, setLoading] = useState(false);

    // 加载数据
    const loadData = async () => {
        try {
            const date = await getQuitDate();
            setQuitDate(date);

            if (!date) return;

            const savedHabits = await getSmokingHabits();
            if (savedHabits) {
                setHabits({
                    pricePerCigarette: savedHabits.price_per_cigarette?.toString() || '',
                    cigarettesPerDay: savedHabits.cigarettes_per_day?.toString() || '',
                    currency: savedHabits.currency || 'CNY'
                });
            }

            const savedGoal = await getGoal();
            if (savedGoal && savedGoal.name) {
                setGoal({
                    name: savedGoal.name,
                    targetAmount: savedGoal.target_amount?.toString() || ''
                });
                setHasGoal(true);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    };

    // 使用 useFocusEffect 确保每次页面获得焦点时刷新数据
    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    // 保存所有设置
    const handleSave = async () => {
        if (!quitDate) {
            Alert.alert('提示', '请先设置戒烟时间');
            return;
        }

        if (!habits.pricePerCigarette || !habits.cigarettesPerDay) {
            Alert.alert('提示', '请填写完整吸烟习惯信息');
            return;
        }

        if (hasGoal && (!goal.name || !goal.targetAmount)) {
            Alert.alert('提示', '请填写完整目标信息');
            return;
        }

        setLoading(true);
        try {
            // 保存吸烟习惯
            const habitsToSave = {
                price_per_cigarette: parseFloat(habits.pricePerCigarette),
                cigarettes_per_day: parseInt(habits.cigarettesPerDay),
                currency: habits.currency
            };

            await saveSmokingHabits(habitsToSave);

            // 保存或清除目标
            if (hasGoal) {
                const targetAmount = parseFloat(goal.targetAmount);
                if (isNaN(targetAmount) || targetAmount <= 0) {
                    throw new Error('目标金额必须是大于0的数字');
                }

                await saveGoal({
                    name: goal.name,
                    target_amount: targetAmount
                });
            } else {
                // 清除目标
                const db = await getDatabase();
                await db.runAsync('DELETE FROM goals;');
            }

            router.back();
        } catch (error) {
            console.error('保存失败:', error);
            Alert.alert('保存失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    if (!quitDate) {
        return (
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-lg mb-4">请先设置戒烟时间</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(modals)/settings/date')}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                    <Text className="text-white">去设置</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-white p-4"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
        >

            {/* 每根烟价格 + 货币选择（同一行） */}
            <View className="flex-row items-center mb-4">
                {/* 每根烟价格 */}
                <View className="w-[50%] mr-2">
                    <Text className="text-lg mb-2">每根烟价格</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-lg"
                        keyboardType="numeric"
                        value={habits.pricePerCigarette}
                        onChangeText={(text) => setHabits({ ...habits, pricePerCigarette: text })}
                        placeholder="例如: 1.5"
                    />
                </View>

                {/* 货币选择 */}
                <View className="w-[50%]">
                    <Text className="text-lg mb-2">货币（上下滑动选择）</Text>
                    <View className="border border-gray-300 rounded-lg overflow-hidden h-[52px] flex-row items-center">
                        <Picker
                            selectedValue={habits.currency || 'CNY'} // 默认值
                            onValueChange={(value) => setHabits({ ...habits, currency: value })}
                            mode="dropdown" // dropdown 会在 Android 上显示箭头
                            style={{ flex: 1, backgroundColor: 'white' }}
                        >
                            <Picker.Item label="人民币" value="CNY" />
                            <Picker.Item label="欧元" value="EUR" />
                        </Picker>
                    </View>
                </View>
            </View>

            {/* 每天吸多少根 */}
            <View className="mb-6">
                <Text className="text-lg mb-2">每天吸多少根</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-lg"
                    keyboardType="numeric"
                    value={habits.cigarettesPerDay}
                    onChangeText={(text) => setHabits({ ...habits, cigarettesPerDay: text })}
                    placeholder="例如: 10"
                />
            </View>

            {/* 目标设置开关 */}
            <View className="flex-row items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
                <Text className="text-lg">设置省钱目标</Text>
                <TouchableOpacity
                    onPress={() => setHasGoal(!hasGoal)}
                    className={`w-12 h-6 rounded-full flex items-center justify-center ${hasGoal ? 'bg-blue-500' : 'bg-gray-400'}`}
                >
                    <View className={`w-5 h-5 bg-white rounded-full ${hasGoal ? 'ml-4' : 'mr-4'}`} />
                </TouchableOpacity>
            </View>

            {/* 目标设置区域 */}
            {hasGoal && (
                <View className="mb-6">
                    <View className="mb-4">
                        <Text className="text-lg mb-2">目标名称</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-lg"
                            value={goal.name}
                            onChangeText={(text) => setGoal({...goal, name: text})}
                            placeholder="例如: 新手机"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-lg mb-2">目标金额</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 text-lg"
                            keyboardType="numeric"
                            value={goal.targetAmount}
                            onChangeText={(text) => setGoal({...goal, targetAmount: text})}
                            placeholder={`例如: 5000 ${habits.currency}`}
                        />
                    </View>
                </View>
            )}

            {/* 保存按钮 */}
            <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className={`py-3 px-4 rounded-lg items-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
            >
                <Text className="text-white text-lg">
                    {loading ? '保存中...' : '保存'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default Money;