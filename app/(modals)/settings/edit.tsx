import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase } from '../../../database/initDB';

const Edit = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    // 加载当前用户名
    useEffect(() => {
        const loadUser = async () => {
            const db = await getDatabase();
            const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
            if (user) {
                setName(user.name);
            }
        };
        loadUser();
    }, []);

    // 保存用户名
    const handleSave = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            const db = await getDatabase();
            await db.runAsync(
                'UPDATE users SET name = ? WHERE id = ?',
                [name.trim(), 0] // 假设用户ID为0
            );
            router.back(); // 返回profile页面
        } catch (error) {
            console.error('保存用户名失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-4">
            <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-6 text-lg"
                placeholder="输入新用户名"
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoFocus
            />

            <TouchableOpacity
                onPress={handleSave}
                disabled={loading || !name.trim()}
                className={`py-3 px-4 rounded-lg items-center ${loading || !name.trim() ? 'bg-gray-400' : 'bg-blue-500'}`}
            >
                <Text className="text-white text-lg">
                    {loading ? '保存中...' : '保存'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Edit;