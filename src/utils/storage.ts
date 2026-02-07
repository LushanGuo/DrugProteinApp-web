// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  USER_TOKEN: 'userToken',
  USER_INFO: 'userInfo',
  REMEMBER_ME: 'rememberMe',
};

export interface UserInfo {
  id: number;
  phone: string;
  email: string;
  purpose: string;
}

export interface RememberMeData {
  remember: boolean;
  credentials: {
    phone: string;
    password: string;
  } | null;
}

// 保存用户token
export const saveUserToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(StorageKeys.USER_TOKEN, token);
    console.log('Token保存成功');
    return true;
  } catch (error) {
    console.error('保存token失败:', error);
    return false;
  }
};

// 获取用户token
export const getUserToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
    return token;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
};

// 保存用户信息
export const saveUserInfo = async (userInfo: UserInfo): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(StorageKeys.USER_INFO, JSON.stringify(userInfo));
    return true;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return false;
  }
};

// 获取用户信息
export const getUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const userInfo = await AsyncStorage.getItem(StorageKeys.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

// 清除所有用户数据
export const clearUserData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      StorageKeys.USER_TOKEN,
      StorageKeys.USER_INFO,
      StorageKeys.REMEMBER_ME,
    ]);
    return true;
  } catch (error) {
    console.error('清除用户数据失败:', error);
    return false;
  }
};

// 保存记住我状态
export const saveRememberMe = async (
  remember: boolean,
  credentials: { phone: string; password: string } | null = null
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(
      StorageKeys.REMEMBER_ME,
      JSON.stringify({
        remember,
        credentials: remember ? credentials : null,
      })
    );
    return true;
  } catch (error) {
    console.error('保存记住我状态失败:', error);
    return false;
  }
};

// 获取记住我状态
export const getRememberMe = async (): Promise<RememberMeData> => {
  try {
    const data = await AsyncStorage.getItem(StorageKeys.REMEMBER_ME);
    return data ? JSON.parse(data) : { remember: false, credentials: null };
  } catch (error) {
    console.error('获取记住我状态失败:', error);
    return { remember: false, credentials: null };
  }
};
