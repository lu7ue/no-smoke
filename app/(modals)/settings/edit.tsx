import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase } from '../../../database/initDB';
import { pickImage } from '../../../utils/imagePicker';

const Edit = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [avatarUri, setAvatarUri] = useState('');
    const [loading, setLoading] = useState(false);

    // 加载当前用户数据
    useEffect(() => {
        const loadUser = async () => {
            const db = await getDatabase();
            const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
            if (user) {
                setName(user.name);
                setAvatarUri(user.avatar || ''); // 可能为空
            }
        };
        loadUser();
    }, []);

    // 选择新头像
    const handlePickAvatar = async () => {
        const uri = await pickImage();
        if (uri) {
            setAvatarUri(uri);
        }
    };

    // 保存用户数据
    const handleSave = async () => {
        setLoading(true);
        try {
            const db = await getDatabase();
            await db.runAsync(
                'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
                [name.trim(), avatarUri, 0] // 假设用户ID为0
            );
            router.back();
        } catch (error) {
            console.error('保存用户数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-4">
            {/* 头像编辑部分 */}
            <View className="items-center mb-6">
                <TouchableOpacity
                    onPress={handlePickAvatar}
                    className="items-center"
                >
                    <Image
                        source={avatarUri ? { uri: avatarUri } : require('../../../assets/images/defaultAvatar.png')}
                        className="w-24 h-24 rounded-full mb-2"
                        defaultSource={require('../../../assets/images/defaultAvatar.png')}
                    />
                    <Text
                        className="text-blue-500 text-base"
                        style={{ textAlign: 'center' }}
                    >
                        更换头像
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 用户名编辑部分 */}
            <Text className="text-lg mb-1">用户名</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-6 text-lg"
                value={name}
                onChangeText={setName}
                maxLength={20}
            />

            <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className={`py-3 px-4 rounded-lg items-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
            >
                <Text className="text-white text-lg">
                    {loading ? '保存中...' : '保存'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Edit;