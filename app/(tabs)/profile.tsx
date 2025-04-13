import { useState, useEffect } from 'react';
import { getDatabase } from '../../database/initDB.js';
import {
    View,
    Text,
    Image,
    ScrollView
} from 'react-native';
import { icons } from '../../constants/icons';

type User = {
    id: number;
    name?: string;
    // avatar?: string;
};

const Profile = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = async () => {
        const db = await getDatabase();
        const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
        setUser(user);
        };
        
        loadUser();
    }, []);

    return (
    <ScrollView className="flex-1 bg-white">
        {/* 用户信息卡片 */}
        <View className="relative bg-white px-0 py-6">
            {/* Edit Icon */}
            <View className="absolute bottom-6 right-10">
                <Image
                    source={icons.edit}
                    className="w-6 h-6"
                    style={{ tintColor: '#6b7280' }}
                />
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
    </ScrollView>
    )
}

export default Profile;