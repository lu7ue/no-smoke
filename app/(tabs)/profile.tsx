import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { databases } from '../../lib/appwrite';
import { icons } from '../../constants/icons';
import { images } from '../../constants/images';

const DATABASE_ID = '67f8125a003b75ef99f9';
const COLLECTION_ID = '67f812d9001ea4674d3f';
const DOCUMENT_ID = '67f81fe40005ae9f79ac';

const Profile = () => {
    const [userData, setUserData] = useState<{ name: string; avatar: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 🔁 每次页面聚焦时重新加载数据
    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID);
                    setUserData({
                        name: response.name,
                        avatar: response.avatar,
                    });
                } catch (error) {
                    console.error('❌ 获取用户数据失败', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }, [])
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const isUsingDefault = !userData?.avatar;

    return (
        <ScrollView className="flex-1 bg-white">
            {/* 用户信息卡片 */}
            <View className="relative bg-white px-0 py-6">
                {/* ✏️ 编辑图标 */}
                <TouchableOpacity
                    onPress={() => router.push('/screens/profileEdit')}
                    className="absolute bottom-6 right-10"
                >
                    <Image
                        source={icons.edit}
                        className="w-6 h-6"
                        style={{ tintColor: '#6b7280' }}
                    />
                </TouchableOpacity>

                <View className="items-center justify-center">
                    {/* 头像 */}
                    <Image
                        source={
                            isUsingDefault
                                ? images.defaultAvatar
                                : { uri: userData.avatar }
                        }
                        className="w-24 h-24 rounded-full mb-2"
                    />
                    {/* 用户名 */}
                    <Text className="text-2xl text-gray-800">
                        {userData?.name || '未知用户'}
                    </Text>
                </View>
            </View>

            {/* 分割线 */}
            <View className="bg-white">
                <View
                    style={{
                        height: 1.5,
                        backgroundColor: '#d1d5db',
                        marginHorizontal: 20,
                        marginBottom: 20,
                    }}
                />
            </View>
        </ScrollView>
    );
};

export default Profile;
