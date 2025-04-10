import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView } from 'react-native';
import quote from '../../assets/quote.json';

export default function Index() {
    const [randomQuote, setRandomQuote] = useState('');

    // 使用 useEffect 确保每次加载页面时都会生成新的随机句子
    useEffect(() => {
        // 随机生成索引
        const randomIndex = Math.floor(Math.random() * quote.length);
        // 设置随机句子
        setRandomQuote(quote[randomIndex]);
    }, []); // 空数组表示只在组件首次加载时触发

    return (
        <ScrollView className="flex-1">
            {/*Daily Quote*/}
            <View
                style={{
                    flex: 1, // 占满屏幕
                    backgroundColor: 'white', // 背景白色
                    paddingHorizontal: 0, // 去掉左右边距，让容器撑满
                    paddingVertical: 0 // 去掉上下边距
                }}
            >
                {/* 标题 */}
                <Text
                    className="text-gray-900 font-bold text-2xl" // 标题颜色、加粗和字号
                    style={{
                        marginTop: 20, // 标题与顶部的距离
                        paddingLeft: 10, // 标题左侧边距
                    }}
                >
                    Daily quote
                </Text>

                {/* 激励语句显示部分 */}
                <View
                    style={{
                        marginTop:6,
                        marginBottom:20,
                        backgroundColor: 'white', // 设置白色背景
                        paddingHorizontal: 10, // 左右内边距
                        paddingVertical: 10, // 上下内边距
                        marginHorizontal: 10, // 容器水平间距
                    }}
                >
                    <Text className="text-gray-700 text-lg" style={{ textAlign: 'left' }}>
                        {randomQuote}
                    </Text>
                </View>
            </View>

            {/* 分割线 */}
            <View
                className='bg-white'
            >
                <View
                    style={{
                        height: 1.5, // 线条高度
                        backgroundColor: '#d1d5db', // 分割线颜色
                        marginHorizontal: 20,
                        marginBottom:20
                    }}
                />
            </View>

            {/*<View className="bg-white p-2">*/}
            {/*    <Text*/}
            {/*        className="text-gray-700 text-lg"*/}
            {/*        style={{*/}
            {/*            color: '#4B5563',*/}
            {/*            textAlign: 'left',*/}
            {/*            lineHeight: 22,*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        Content for section 2*/}
            {/*    </Text>*/}
            {/*</View>*/}
        </ScrollView>
    );
}
