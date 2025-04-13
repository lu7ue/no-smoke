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
    // avatar?: string;
};

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useFocusEffect(() => {
        const loadUser = async () => {
            const db = await getDatabase();
            const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
            setUser(user);
        };
        loadUser();
    });

    return (
    <ScrollView className="flex-1 bg-white">
        {/* 用户信息卡片 */}
        <View className="relative bg-white px-0 py-6">
            {/* Edit Icon */}
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
                {/* 头像 */}
                {/*暂时只使用这一张默认图片 使用require()直接读取 不经过数据库*/}
                <Image
                    source={require('../../assets/images/defaultAvatar.png')}
                    className="w-24 h-24 rounded-full mb-2"
                />

                {/* 用户ID */}
                {/*<Text className="text-2xl text-gray-800">*/}
                {/*    {user?.id}*/}
                {/*</Text>*/}

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
    </ScrollView>
    )
}

export default Profile;