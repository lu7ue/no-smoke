import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import quote from '../../assets/quote.json';
import { getDatabase, getQuitDate } from '../../database/initDB';
import { useRouter, useFocusEffect } from 'expo-router';

export default function Index() {
    const router = useRouter();
    const [randomQuote, setRandomQuote] = useState('');
    const [quitDuration, setQuitDuration] = useState('');
    const [quitDate, setQuitDate] = useState<Date | null>(null);

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
            if (date) {
                setQuitDate(date);
                calculateDuration(date);
            }
        } catch (error) {
            console.error('加载戒烟日期失败:', error);
        }
    };

    // 使用 useFocusEffect 加载戒烟数据
    useFocusEffect(() => {
        loadQuitData();
    });

    // 使用 useEffect 初始化应用
    useEffect(() => {
        const initApp = async () => {
            await getDatabase(); // 初始化数据库
            await loadQuitData(); // 加载戒烟数据

            // 设置随机激励语句
            const randomIndex = Math.floor(Math.random() * quote.length);
            setRandomQuote(quote[randomIndex]);
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
        </ScrollView>
    );
}