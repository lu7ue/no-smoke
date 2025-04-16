import * as ImagePicker from 'expo-image-picker';

// 请求相册权限并选择图片
export const pickImage = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        alert('需要相册权限才能上传头像');
        return null;
    }

    // 打开相册选择图片
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,  // 允许简单编辑
        aspect: [1, 1],      // 1:1比例
        quality: 0.8,        // 80%质量
    });

    // 返回选择的图片URI
    if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
    }
    return null;
};