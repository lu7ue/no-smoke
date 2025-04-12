// app/(tabs)/edit.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { databases } from '../../lib/appwrite';
import { Client, Storage, ID } from 'appwrite';
import { Stack } from 'expo-router';

const DATABASE_ID = '67f8125a003b75ef99f9';
const COLLECTION_ID = '67f812d9001ea4674d3f';
const DOCUMENT_ID = '67f81fe40005ae9f79ac';
const BUCKET_ID = '67fa654f003d80cd3664';

// 设置 storage 实例
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67f811d9000096544772');

const storage = new Storage(client);

const EditProfile = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID);
                setName(res.name);
                setAvatar(res.avatar); // 加载当前头像
            } catch (error) {
                console.error('❌ 加载失败', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const fileName = imageUri.split('/').pop();

            const response = await fetch(imageUri);
            const blob = await response.blob();

            const file = new File([blob], fileName || 'avatar.jpg');

            try {
                const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
                const fileId = uploaded.$id;

                const previewUrl = storage.getFilePreview(BUCKET_ID, fileId).toString();
                setAvatar(previewUrl);

                Alert.alert('✅ 头像已上传');
            } catch (error) {
                console.error('❌ 上传失败', error);
            }
        }
    };

    const handleSave = async () => {
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, DOCUMENT_ID, {
                name: name,
                avatar: avatar,
            });
            Alert.alert('✅ 修改成功');
            router.back();
        } catch (error) {
            console.error('❌ 修改失败', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>加载中...</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: '编辑资料',           // 页面标题
                    headerBackTitle: '返回',    // 返回按钮的文字（iOS）
                }}
            />
            <View className="flex-1 bg-white px-6 pt-20">
                {/* 头像显示 + 选择按钮 */}
                <TouchableOpacity onPress={handlePickImage} className="items-center mb-6">
                    <Image
                        source={avatar ? { uri: avatar } : require('../../assets/images/defaultAvatar.png')}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                    <Text className="text-blue-500 mt-2">点击更换头像</Text>
                </TouchableOpacity>

                {/* 用户名输入 */}
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="输入新用户名"
                    className="border border-gray-300 rounded px-4 py-2 mb-6"
                />
                <Button title="保存" onPress={handleSave} />
            </View>
        </>

    );

};

export default EditProfile;
