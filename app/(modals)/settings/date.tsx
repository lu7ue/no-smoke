import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { saveQuitDate, getQuitDate } from '../../../database/initDB';

const DatePage = () => {
    const router = useRouter();
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [quitDuration, setQuitDuration] = useState('');

    // 加载保存的戒烟日期
    useEffect(() => {
        const loadQuitDate = async () => {
            const savedDate = await getQuitDate();
            if (savedDate) {
                setDate(savedDate);
                calculateDuration(savedDate);
            }
        };
        loadQuitDate();
    }, []);

    // 计算戒烟时长
    const calculateDuration = (quitDate: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - quitDate.getTime();

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setQuitDuration(`${days}天 ${hours}小时 ${minutes}分钟`);
    };

    // 处理日期变化
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            calculateDuration(selectedDate);
        }
    };

    // 保存戒烟日期
    const handleSave = async () => {
        await saveQuitDate(date);
        router.back();
    };

    return (
        <View className="flex-1 bg-white p-4">
            <View className="mb-8">
                <Text className="text-lg mb-2">当前戒烟开始时间:</Text>
                <Text className="text-xl font-semibold">
                    {date.toLocaleDateString('zh-CN')}
                </Text>
            </View>

            {quitDuration && (
                <View className="mb-8">
                    <Text className="text-lg mb-2">您已坚持戒烟:</Text>
                    <Text className="text-xl font-semibold text-green-600">
                        {quitDuration}
                    </Text>
                </View>
            )}

            {/* 日期选择按钮 - Android */}
            {Platform.OS === 'android' && (
                <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    className="bg-blue-500 py-3 px-4 rounded-lg items-center mb-8"
                >
                    <Text className="text-white text-lg">选择戒烟开始日期</Text>
                </TouchableOpacity>
            )}

            {/* 日期选择器 - iOS 默认显示 */}
            {(showPicker || Platform.OS === 'ios') && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                    locale="zh-CN"
                />
            )}

            {/* iOS 需要额外的确认按钮 */}
            {Platform.OS === 'ios' && (
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-green-500 py-3 px-4 rounded-lg items-center mt-4"
                >
                    <Text className="text-white text-lg">确认</Text>
                </TouchableOpacity>
            )}

            {/* Android 保存按钮 */}
            {Platform.OS === 'android' && (
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-green-500 py-3 px-4 rounded-lg items-center"
                >
                    <Text className="text-white text-lg">保存并返回</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default DatePage;