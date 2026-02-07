// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authAPI } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Login: { registeredPhone?: string };
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
}

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const [phone, setPhone] = useState(route.params?.registeredPhone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // 去除首尾空格
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedPhone || !trimmedPassword) {
      Alert.alert('提示', '请输入手机号和密码');
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(trimmedPhone)) {
      Alert.alert('提示', '请输入正确的手机号格式');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('提示', '密码至少需要6位');
      return;
    }

    setLoading(true);
    try {
      console.log('📱 尝试登录:', trimmedPhone);
      const result = await authAPI.login({ 
        phone: trimmedPhone, 
        password: trimmedPassword 
      });
      
      console.log('📥 登录结果:', result);
      
      if (result.success) {
        console.log('✅ 登录成功，跳转到主页');
        // 直接跳转，不显示提示
        navigation.replace('Home');
      } else {
        console.log('❌ 登录失败:', result.message);
        Alert.alert('登录失败', result.message || '请检查账号密码');
      }
    } catch (error: any) {
      console.error('❌ 登录错误:', error);
      console.error('错误详情:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // 优先使用后端返回的错误信息
      let errorMessage = '网络错误，请检查网络连接';
      
      if (error.response?.data) {
        // 后端返回的标准格式：{ success: false, message: "密码错误", data: null }
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('登录失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 顶部装饰波浪 */}
          <View style={styles.topWave}>
            <View style={styles.waveCircle1} />
            <View style={styles.waveCircle2} />
          </View>

          {/* Logo 区域 */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="molecule" size={60} color="#fff" />
            </View>
            <Text style={styles.appName}>药物筛选平台</Text>
            <Text style={styles.appSubtitle}>Breast Cancer Drug Screening</Text>
            <View style={styles.subtitleLine} />
          </View>

          {/* 登录表单卡片 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="account-circle" size={28} color="#4CAF50" />
              <Text style={styles.title}>账号登录</Text>
            </View>
            
            {/* 手机号输入 */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>手机号</Text>
              <View style={styles.inputContainer}>
                <Icon name="cellphone" size={22} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="请输入11位手机号"
                  placeholderTextColor="#B0BEC5"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            {/* 密码输入 */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>密码</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  placeholderTextColor="#B0BEC5"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#78909C" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 忘记密码 */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>忘记密码？</Text>
            </TouchableOpacity>

            {/* 登录按钮 */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>登 录</Text>
                  <Icon name="arrow-right" size={20} color="white" style={styles.arrowIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 注册提示 */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerHint}>还没有账号？</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>立即注册</Text>
            </TouchableOpacity>
          </View>

          {/* 底部信息 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 乳腺癌药物筛选平台</Text>
            <Text style={styles.footerSubtext}>CDK2/1e9h 靶点分析系统 • 仅供科研使用</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
  },
  waveCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -200,
    right: -100,
  },
  waveCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -100,
    left: -80,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 50,
    zIndex: 1,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  subtitleLine: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginTop: -30,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238',
    marginLeft: 10,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#546E7A',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEF2',
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#263238',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 25,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#81C784',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    marginHorizontal: 20,
    borderRadius: 15,
  },
  registerHint: {
    fontSize: 15,
    color: '#78909C',
  },
  registerLink: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#90A4AE',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#B0BEC5',
    letterSpacing: 0.2,
  },
});

export default LoginScreen;
