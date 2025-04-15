import { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { getDatabase } from '../../database/initDB.js';
import {
    View,
    Text,
    Image,
    ScrollView
} from 'react-native';
import { icons } from '../../constants/icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

type User = {
    id: number;
    name?: string;
    avatar?: string;
};

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    // 加载用户数据
    const loadUser = async () => {
        const db = await getDatabase();
        const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
        setUser(user);
    };

    // 使用 useFocusEffect 确保每次页面获得焦点时刷新数据
    useFocusEffect(() => {
        loadUser();
    });

    return (
        <ScrollView className="flex-1 bg-white">
            {/* 用户信息卡片 */}
            <View className="relative bg-white px-0 py-6">
                {/* 编辑按钮 */}
                <View className="absolute bottom-6 right-10">
                    <TouchableOpacity onPress={() => router.push('/(modals)/settings/edit')}>
                        <Image
                            source={icons.edit}
                            className="w-6 h-6"
                            style={{ tintColor: '#6b7280' }}
                        />
                    </TouchableOpacity>
                </View>

                <View className="items-center justify-center">
                    {/* 头像 - 显示用户上传的头像或默认头像 */}
                    <Image
                        source={
                            user?.avatar && user.avatar !== ''
                                ? { uri: user.avatar }
                                : require('../../assets/images/defaultAvatar.png')
                        }
                        className="w-24 h-24 rounded-full mb-2"
                        defaultSource={require('../../assets/images/defaultAvatar.png')} // 添加默认源
                    />

                    {/* 用户名 */}
                    <Text className="text-2xl text-gray-800">
                        {user?.name || 'Unknown'}
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

            {/* 设置戒烟时间 行 */}
            <TouchableOpacity
                onPress={() => router.push('/(modals)/settings/date')}
                className="flex-row justify-between items-center bg-white p-2 mb-4 ml-4 mr-4"
            >
                <Text
                    className="text-gray-700 text-2xl"
                    style={{
                        color: '#4B5563',
                        textAlign: 'left',
                        lineHeight: 22,
                    }}
                >
                    设置戒烟时间
                </Text>

                <Text className="text-2xl text-gray-400 mr-4">{'>'}</Text>
            </TouchableOpacity>

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

            {/* 设置金额 */}
            <TouchableOpacity
                onPress={() => router.push('/(modals)/settings/money')}
                className="flex-row justify-between items-center bg-white p-2 mb-4 ml-4 mr-4"
            >
                <Text
                    className="text-gray-700 text-2xl"
                    style={{
                        color: '#4B5563',
                        textAlign: 'left',
                        lineHeight: 22,
                    }}
                >
                    设置目标
                </Text>

                <Text className="text-2xl text-gray-400 mr-4">{'>'}</Text>
            </TouchableOpacity>

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

            {/* 数据导出 */}
            <TouchableOpacity
                onPress={() => router.push('/(modals)/settings/export')}
                className="flex-row justify-between items-center bg-white p-2 mb-4 ml-4 mr-4"
            >
                <Text
                    className="text-gray-700 text-2xl"
                    style={{
                        color: '#4B5563',
                        textAlign: 'left',
                        lineHeight: 22,
                    }}
                >
                    导出数据
                </Text>

                <Text className="text-2xl text-gray-400 mr-4">{'>'}</Text>
            </TouchableOpacity>

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

            {/* 数据导入 */}
            <TouchableOpacity
                onPress={() => router.push('/(modals)/settings/import')}
                className="flex-row justify-between items-center bg-white p-2 mb-4 ml-4 mr-4"
            >
                <Text
                    className="text-gray-700 text-2xl"
                    style={{
                        color: '#4B5563',
                        textAlign: 'left',
                        lineHeight: 22,
                    }}
                >
                    导入数据
                </Text>

                <Text className="text-2xl text-gray-400 mr-4">{'>'}</Text>
            </TouchableOpacity>
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
    )
}

export default Profile;