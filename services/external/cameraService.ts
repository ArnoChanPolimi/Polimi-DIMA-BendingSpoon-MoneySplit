// services\external\cameraService.ts
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export const handleReceiptCapture = async (mode: 'camera' | 'library') => {
  // 1. 如果是 Web 模式强行调相机，直接拦截
  if (mode === 'camera' && Platform.OS === 'web') {
    return null;
  }

  // 2. 权限处理
  if (mode === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相机权限拍照');
      return null;
    }
  }

  // 3. 执行对应的 Expo API
  const options: ImagePicker.ImagePickerOptions = {
    allowsEditing: Platform.OS !== 'web', // 手机端开启裁剪，Web端关闭
    quality: 0.7,
  };

  const result = mode === 'camera' 
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  return !result.canceled ? result.assets[0].uri : null;
};